import { createRequire } from "node:module";
import * as path from "node:path";

import type { TypeScriptProjectHost } from "@volar/typescript";
import {
	createLanguageServiceHost,
	resolveFileLanguageId,
} from "@volar/typescript";
import * as vue from "@vue/language-core";
import { normalizePath } from "@vue.ts/common";
import type ts from "typescript/lib/tsserverlibrary";

import { createHelpers } from "./helpers";

const require = createRequire(import.meta.url);

function createLanguage(
	tsconfigPath: string,
	ts: typeof import("typescript/lib/tsserverlibrary") = require("typescript"),
) {
	const tsconfig = normalizePath(tsconfigPath);

	return createLanguageWorker(
		() => vue.createParsedCommandLine(ts, ts.sys, tsconfigPath, true),
		path.dirname(tsconfig),
		ts,
	);
}

function createLanguageWorker(
	loadParsedCommandLine: () => vue.ParsedCommandLine,
	rootPath: string,
	ts: typeof import("typescript/lib/tsserverlibrary"),
) {
	let parsedCommandLine = loadParsedCommandLine();
	let fileNames = new Set(
		parsedCommandLine.fileNames.map((fileName) => normalizePath(fileName)),
	);
	let projectVersion = 0;

	const projectHost: TypeScriptProjectHost = {
		getCurrentDirectory: () => rootPath,
		getProjectVersion: () => projectVersion.toString(),
		getCompilationSettings: () => parsedCommandLine.options,
		getScriptFileNames: () => [...fileNames],
		getProjectReferences: () => parsedCommandLine.projectReferences,
	};

	const scriptSnapshots = new Map<string, ts.IScriptSnapshot | undefined>();

	const vueLanguagePlugin = vue.createVueLanguagePlugin<string>(
		ts,
		projectHost.getCompilationSettings(),
		parsedCommandLine.vueOptions,
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
		language as any,
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

	const program = tsLs.getProgram()!;
	const typeChecker = program.getTypeChecker();

	const helpers = createHelpers(
		language,
		program,
		parsedCommandLine.vueOptions,
		ts,
	);

	return {
		...helpers,
		updateFile(fileName: string, text: string) {
			fileName = normalizePath(fileName);
			scriptSnapshots.set(fileName, ts.ScriptSnapshot.fromString(text));
			fileNames.add(fileName);
			projectVersion++;
		},
		deleteFile(fileName: string) {
			fileName = normalizePath(fileName);
			fileNames.delete(fileName);
			projectVersion++;
		},
		reload() {
			parsedCommandLine = loadParsedCommandLine();
			fileNames = new Set(
				parsedCommandLine.fileNames.map((fileName) => normalizePath(fileName)),
			);
			this.clearCache();
		},
		clearCache() {
			scriptSnapshots.clear();
			projectVersion++;
		},
		__internal__: {
			tsLs,
			program,
			typeChecker,
		},
	};
}

type Language = ReturnType<typeof createLanguage>;

const LANGUAGE_GLOBAL_KEY = "__VUETS_LANGUAGE__";
export function ensureLanguage(tsconfigPath: string) {
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
