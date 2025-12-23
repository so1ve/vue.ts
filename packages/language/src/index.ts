import { createRequire } from "node:module";
import * as path from "node:path";

import type { TypeScriptProjectHost } from "@volar/typescript";
import {
	createLanguageServiceHost,
	resolveFileLanguageId,
} from "@volar/typescript";
import * as vue from "@vue/language-core";
import { normalizePath } from "@vue.ts/shared";
import type ts from "typescript/lib/tsserverlibrary";

import { createHelpers } from "./helpers";

const require = createRequire(import.meta.url);

function createLanguage(
	tsconfigPath: string,
	ts: typeof import("typescript/lib/tsserverlibrary") = require("typescript"),
): ReturnType<typeof createLanguageWorker> {
	const tsconfig = normalizePath(tsconfigPath);

	return createLanguageWorker(
		ts,
		() => {
			const commandLine = vue.createParsedCommandLine(ts, ts.sys, tsconfig);
			const { fileNames } = ts.parseJsonSourceFileConfigFileContent(
				ts.readJsonConfigFile(tsconfig, ts.sys.readFile),
				ts.sys,
				path.dirname(tsconfig),
				{},
				tsconfig,
				undefined,
				vue.getAllExtensions(commandLine.vueOptions).map((extension) => ({
					extension: extension.slice(1),
					isMixedContent: true,
					scriptKind: ts.ScriptKind.Deferred,
				})),
			);

			return [commandLine, fileNames];
		},
		path.dirname(tsconfig),
	);
}

function createLanguageWorker(
	ts: typeof import("typescript/lib/tsserverlibrary"),
	getConfigAndFiles: () => [
		commandLine: vue.ParsedCommandLine,
		fileNames: string[],
	],
	rootPath: string,
) {
	let [{ vueOptions, options, projectReferences }, fileNames] =
		getConfigAndFiles();
	let fileNamesSet = new Set(
		fileNames.map((fileName) => normalizePath(fileName)),
	);
	let projectVersion = 0;

	const projectHost: TypeScriptProjectHost = {
		getCurrentDirectory: () => rootPath,
		getProjectVersion: () => projectVersion.toString(),
		getCompilationSettings: () => options,
		getScriptFileNames: () => [...fileNamesSet],
		getProjectReferences: () => projectReferences,
	};

	const scriptSnapshots = new Map<string, ts.IScriptSnapshot | undefined>();

	const vueLanguagePlugin = vue.createVueLanguagePlugin<string>(
		ts,
		projectHost.getCompilationSettings(),
		vueOptions,
		(id) => id,
	);

	const language = vue.createLanguage(
		[
			vueLanguagePlugin,
			{
				getLanguageId(fileName) {
					return resolveFileLanguageId(fileName);
				},
			},
		],
		new vue.FileMap(ts.sys.useCaseSensitiveFileNames),
		(fileName) => {
			let snapshot = scriptSnapshots.get(fileName);

			if (!scriptSnapshots.has(fileName)) {
				const fileText = ts.sys.readFile(fileName);
				if (fileText) {
					scriptSnapshots.set(fileName, ts.ScriptSnapshot.fromString(fileText));
				} else {
					scriptSnapshots.set(fileName, undefined);
				}
			}

			snapshot = scriptSnapshots.get(fileName);

			if (snapshot) {
				language.scripts.set(fileName, snapshot);
			} else {
				language.scripts.delete(fileName);
			}
		},
	);

	const { languageServiceHost } = createLanguageServiceHost(
		ts,
		ts.sys,
		language,
		(s) => s,
		projectHost,
	);
	const tsLs = ts.createLanguageService(languageServiceHost);

	const getScriptKind =
		languageServiceHost.getScriptKind?.bind(languageServiceHost);
	languageServiceHost.getScriptKind = (fileName) => {
		if (fileName.endsWith(".vue.js")) {
			return ts.ScriptKind.TS;
		}
		if (fileName.endsWith(".vue.jsx")) {
			return ts.ScriptKind.TSX;
		}

		return getScriptKind!(fileName);
	};

	const helpers = createHelpers(language, tsLs, vueOptions, ts);

	return {
		...helpers,
		tsLs,
		updateFile(fileName: string, text: string) {
			fileName = normalizePath(fileName);
			scriptSnapshots.set(fileName, ts.ScriptSnapshot.fromString(text));
			fileNamesSet.add(fileName);
			projectVersion++;
		},
		deleteFile(fileName: string) {
			fileName = normalizePath(fileName);
			fileNamesSet.delete(fileName);
			projectVersion++;
		},
		reload() {
			[{ vueOptions, options, projectReferences }, fileNames] =
				getConfigAndFiles();
			fileNamesSet = new Set(fileNames.map(normalizePath));
			this.clearCache();
		},
		clearCache() {
			scriptSnapshots.clear();
			projectVersion++;
		},
	};
}

type Language = ReturnType<typeof createLanguage>;

const LANGUAGE_GLOBAL_KEY = "__VUETS_LANGUAGE__";
export function ensureLanguage(tsconfigPath: string): void {
	if (!(globalThis as any)[LANGUAGE_GLOBAL_KEY]) {
		(globalThis as any)[LANGUAGE_GLOBAL_KEY] = createLanguage(tsconfigPath);
	}
}

export function getLanguage(): Language {
	if (!(globalThis as any)[LANGUAGE_GLOBAL_KEY]) {
		throw new Error("[@vue.ts/language] Language not created!");
	}

	return (globalThis as any)[LANGUAGE_GLOBAL_KEY];
}
