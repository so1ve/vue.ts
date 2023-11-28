import { createRequire } from "node:module";
import * as path from "node:path";

import {
	createLanguageServiceHost,
	decorateLanguageService,
} from "@volar/typescript";
import * as vue from "@vue/language-core";
import type ts from "typescript/lib/tsserverlibrary";

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
	const tsLsHost = createLanguageServiceHost(core, ts, ts.sys);
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

	function findNode(
		filepath: string,
		filter: (ranges: vue.ScriptSetupRanges) => vue.TextRange | undefined,
	):
		| {
				virtualFileNode: ts.Node;
				scriptNode: ts.Node;
				setupRange: vue.TextRange;
				scriptSetupAst: ts.SourceFile;
				virtualFileAst: ts.SourceFile;
				offset: number;
		  }
		| undefined {
		filepath = normalizePath(filepath);
		const sourceFile = core.virtualFiles.getSource(filepath)?.root;
		if (!(sourceFile instanceof vue.VueFile)) {
			return;
		}
		if (!sourceFile.sfc.scriptSetup) {
			return;
		}
		const {
			ast: scriptSetupAst,
			startTagEnd: offset,
			lang,
		} = sourceFile.sfc.scriptSetup;
		if (lang !== "ts" && lang !== "tsx") {
			return;
		}
		// We get volar's generated virtual ts file because `scriptSetupAst`
		// is the ast of `<script setup>` block, which is not in the program
		// and cannot be used by type checker.
		const virtualFileAst = program.getSourceFile(`${filepath}.${lang}`);
		if (!virtualFileAst) {
			return;
		}
		const scriptSetupRanges = vue.parseScriptSetupRanges(
			ts,
			scriptSetupAst,
			vueCompilerOptions,
		);
		const virtualTsFileScriptSetupRanges = vue.parseScriptSetupRanges(
			ts,
			virtualFileAst,
			vueCompilerOptions,
		);
		const sourceRange = filter(scriptSetupRanges);
		const virtualTsRange = filter(virtualTsFileScriptSetupRanges);
		if (!sourceRange || !virtualTsRange) {
			return;
		}
		let foundVirtualFileNode!: ts.Node;
		virtualFileAst.forEachChild(function traverse(node: ts.Node) {
			if (
				node.getStart(virtualFileAst) === virtualTsRange.start &&
				node.getEnd() === virtualTsRange.end
			) {
				foundVirtualFileNode = node;
			} else {
				node.forEachChild(traverse);
			}
		});
		let foundSetupNode!: ts.Node;
		scriptSetupAst.forEachChild(function traverse(node: ts.Node) {
			if (
				node.getStart(scriptSetupAst) === sourceRange.start &&
				node.getEnd() === sourceRange.end
			) {
				foundSetupNode = node;
			} else {
				node.forEachChild(traverse);
			}
		});

		const setupRange: vue.TextRange = {
			start: offset + sourceRange.start,
			end: offset + sourceRange.end,
		};

		return {
			virtualFileNode: foundVirtualFileNode,
			scriptNode: foundSetupNode,
			setupRange,
			scriptSetupAst,
			virtualFileAst,
			offset,
		};
	}

	return {
		findNode,
		__internal__: {
			tsLs,
			program,
			typeChecker,
		},
	};
}

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
