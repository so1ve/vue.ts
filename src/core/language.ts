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
		id: string,
	): { type: ts.Type; offset: number } | undefined {
		id = normalizePath(id);
		const sourceFile = core.virtualFiles.getSource(id)?.root;
		if (!(sourceFile instanceof vue.VueFile)) {
			return;
		}
		const scriptSetupAst = sourceFile.sfc.scriptSetup?.ast;
		if (!scriptSetupAst) {
			return;
		}
		const snapshot = sourceFile.snapshot;
		const scriptSetupRanges = vue.parseScriptSetupRanges(
			ts,
			scriptSetupAst,
			vueCompilerOptions,
		);
		const definePropsRange = scriptSetupRanges.props.define;
		if (!definePropsRange || !definePropsRange.typeArg) {
			return;
		}
		const parsed = vue.parse(snapshot.getText(0, snapshot.getLength()));
		if (!parsed.descriptor.scriptSetup) {
			return;
		}
		let definePropsType!: ts.Type;
		ts.forEachChild(scriptSetupAst, (node) => {
			if (
				node.getFullStart() + 2 === definePropsRange.start &&
				node.getEnd() - 1 === definePropsRange.end &&
				ts.isExpressionStatement(node) &&
				ts.isCallExpression(node.expression)
			) {
				console.log(node.expression.typeArguments![0]);
				definePropsType = typeChecker.getTypeAtLocation(
					node.expression.typeArguments![0],
				);
			}
		});
		const scriptSetupOffset: number =
			parsed.descriptor.scriptSetup.loc.start.offset;

		return { type: definePropsType, offset: scriptSetupOffset };
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

export function ensureLanguage(tsconfigPath: string) {
	if (!(globalThis as any).__UNPLUGIN_VUE_COMPLEX_LANGUAGE__) {
		(globalThis as any).__UNPLUGIN_VUE_COMPLEX_LANGUAGE__ =
			createLanguage(tsconfigPath);
	}
}

export function getLanguage(): Language {
	if (!(globalThis as any).__UNPLUGIN_VUE_COMPLEX_LANGUAGE__) {
		throw new Error("[unplugin-vue-complex-types] Language not created!");
	}

	return (globalThis as any).__UNPLUGIN_VUE_COMPLEX_LANGUAGE__;
}
