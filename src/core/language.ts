import { createRequire } from "node:module";
import * as path from "node:path";

import {
	createLanguageServiceHost,
	decorateLanguageService,
} from "@volar/typescript";
import * as vue from "@vue/language-core";
import type * as ts from "typescript/lib/tsserverlibrary";

import { normalizePath } from "./utils";

const require = createRequire(import.meta.url);

function createLanguage(
	tsconfigPath: string,
	ts: typeof import("typescript/lib/tsserverlibrary") = require("typescript"),
) {
	const tsconfig = normalizePath(tsconfigPath);

	return createLanguageWorker(
		() => vue.createParsedCommandLine(ts, ts.sys, tsconfigPath),
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
	let fileNames = parsedCommandLine.fileNames.map(normalizePath);
	let projectVersion = 0;

	const scriptSnapshots = new Map<string, ts.IScriptSnapshot>();
	const _host: vue.TypeScriptLanguageHost = {
		workspacePath: rootPath,
		rootPath,
		getProjectVersion: () => projectVersion.toString(),
		getCompilationSettings: () => parsedCommandLine.options,
		getScriptFileNames: () => fileNames,
		getProjectReferences: () => parsedCommandLine.projectReferences,
		getScriptSnapshot: (fileName) => {
			if (!scriptSnapshots.has(fileName)) {
				const fileText = ts.sys.readFile(fileName);
				if (fileText !== undefined) {
					scriptSnapshots.set(fileName, ts.ScriptSnapshot.fromString(fileText));
				}
			}

			return scriptSnapshots.get(fileName);
		},
	};

	return {
		...baseCreateLanguageWorker(
			_host,
			vue.resolveVueCompilerOptions(parsedCommandLine.vueOptions),
			ts,
		),
		updateFile(fileName: string, text: string) {
			fileName = normalizePath(fileName);
			scriptSnapshots.set(fileName, ts.ScriptSnapshot.fromString(text));
			projectVersion++;
		},
		deleteFile(fileName: string) {
			fileName = normalizePath(fileName);

			fileNames = fileNames.filter((f) => f !== fileName);
			projectVersion++;
		},
		reload() {
			parsedCommandLine = loadParsedCommandLine();
			fileNames = parsedCommandLine.fileNames.map(normalizePath);
			this.clearCache();
		},
		clearCache() {
			scriptSnapshots.clear();
			projectVersion++;
		},
	};
}

type Language = ReturnType<typeof createLanguage>;

function baseCreateLanguageWorker(
	host: vue.TypeScriptLanguageHost,
	vueCompilerOptions: vue.VueCompilerOptions,
	ts: typeof import("typescript/lib/tsserverlibrary"),
) {
	const vueLanguages = ts
		? // eslint-disable-next-line etc/no-deprecated
		  vue.createLanguages(host.getCompilationSettings(), vueCompilerOptions, ts)
		: [];
	const core = vue.createLanguageContext(host, vueLanguages);
	const tsLsHost = createLanguageServiceHost(core, ts, ts.sys, undefined);
	const tsLs = ts.createLanguageService(tsLsHost);

	decorateLanguageService(core.virtualFiles, tsLs, false);

	const getScriptKind = tsLsHost.getScriptKind!;
	tsLsHost.getScriptKind = (fileName) => {
		if (fileName.endsWith(".vue.js")) {
			return ts.ScriptKind.TS;
		}
		if (fileName.endsWith(".vue.jsx")) {
			return ts.ScriptKind.TSX;
		}

		return getScriptKind(fileName);
	};

	const program = tsLs.getProgram()!;
	const typeChecker = program.getTypeChecker();

	function findDefinePropsTypeArg(
		path: string,
	): { type: ts.Type; range: [number, number] } | undefined {
		path = normalizePath(path);
		const sourceFile = core.virtualFiles.getSource(path)?.root;
		if (!(sourceFile instanceof vue.VueFile)) {
			return;
		}
		if (!sourceFile.sfc.scriptSetup) {
			return;
		}
		const {
			ast: scriptSetupAst,
			startTagEnd,
			lang,
		} = sourceFile.sfc.scriptSetup;
		if (lang !== "ts" && lang !== "tsx") {
			return;
		}
		const virtualFile = program.getSourceFile(`${path}.${lang}`);
		if (!virtualFile) {
			return;
		}
		const scriptSetupRanges = vue.parseScriptSetupRanges(
			ts,
			scriptSetupAst,
			vueCompilerOptions,
		);
		const virtualFileScriptSetupRanges = vue.parseScriptSetupRanges(
			ts,
			virtualFile,
			vueCompilerOptions,
		);
		const definePropsTypeRange =
			virtualFileScriptSetupRanges.props.define?.typeArg;
		if (!definePropsTypeRange) {
			return;
		}
		let definePropsType!: ts.Type;
		virtualFile.forEachChild(function traverse(node: ts.Node) {
			if (
				node.getStart(virtualFile) === definePropsTypeRange.start &&
				node.getEnd() === definePropsTypeRange.end
			) {
				definePropsType = typeChecker.getTypeAtLocation(node);
			} else {
				node.forEachChild(traverse);
			}
		});

		const range = [
			startTagEnd + scriptSetupRanges.props.define!.typeArg!.start,
			startTagEnd + scriptSetupRanges.props.define!.typeArg!.end,
		] as [number, number];

		return { type: definePropsType, range };
	}

	return {
		findDefinePropsTypeArg,
		__internal__: {
			tsLs,
			program,
			typeChecker,
		},
	};
}

const LANGUAGE_GLOBAL_KEY = "__UNPLUGIN_VUE_COMPLEX_LANGUAGE__";
export function ensureLanguage(tsconfigPath: string) {
	if (!(globalThis as any)[LANGUAGE_GLOBAL_KEY]) {
		(globalThis as any)[LANGUAGE_GLOBAL_KEY] = createLanguage(tsconfigPath);
	}
}

export function getLanguage(): Language {
	if (!(globalThis as any)[LANGUAGE_GLOBAL_KEY]) {
		throw new Error("[unplugin-vue-complex-types] Language not created!");
	}

	return (globalThis as any)[LANGUAGE_GLOBAL_KEY];
}