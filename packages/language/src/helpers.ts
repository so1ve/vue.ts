import * as vue from "@vue/language-core";
import type ts from "typescript/lib/tsserverlibrary";

export function createHelpers(
	language: vue.Language<string>,
	tsLs: ts.LanguageService,
	vueCompilerOptions: vue.VueCompilerOptions,
	ts: typeof import("typescript/lib/tsserverlibrary"),
): {
	parseScriptSetupRanges: (ast: ts.SourceFile) => vue.ScriptSetupRanges;
	getScriptSetupBlock: (normalizedFilepath: string) => vue.Sfc["scriptSetup"];
	getScriptSetupAst: (normalizedFilepath: string) => ts.SourceFile | undefined;
	getVirtualFileOrTsAst: (
		normalizedFilepath: string,
	) => ts.SourceFile | undefined;
	traverseAst: (ast: ts.SourceFile, cb: (node: ts.Node) => void) => void;
	findNodeByRange: (
		ast: ts.SourceFile,
		filter: (ranges: vue.ScriptSetupRanges) => vue.TextRange | undefined,
	) => ts.Node | undefined;
	findNodeByName: (ast: ts.SourceFile, name: string) => ts.Node | undefined;
} {
	const parseScriptSetupRanges = (ast: ts.SourceFile): vue.ScriptSetupRanges =>
		vue.parseScriptSetupRanges(ts, ast, vueCompilerOptions);

	function getScriptSetupBlock(
		normalizedFilepath: string,
	): vue.Sfc["scriptSetup"] {
		const sourceFile =
			language.scripts.get(normalizedFilepath)?.generated?.root;
		if (!(sourceFile instanceof vue.VueVirtualCode)) {
			return;
		}
		if (!sourceFile.sfc.scriptSetup) {
			return;
		}
		const { lang } = sourceFile.sfc.scriptSetup;
		if (lang !== "ts" && lang !== "tsx") {
			return;
		}

		return sourceFile.sfc.scriptSetup;
	}

	function getScriptSetupAst(
		normalizedFilepath: string,
	): ts.SourceFile | undefined {
		const scriptSetupBlock = getScriptSetupBlock(normalizedFilepath);
		if (!scriptSetupBlock) {
			return;
		}

		return scriptSetupBlock.ast;
	}

	function getVirtualFileOrTsAst(
		normalizedFilepath: string,
	): ts.SourceFile | undefined {
		const program = tsLs.getProgram()!;
		let virtualFileOrTsAst = program.getSourceFile(normalizedFilepath);
		if (virtualFileOrTsAst) {
			return virtualFileOrTsAst;
		}
		const scriptSetupBlock = getScriptSetupBlock(normalizedFilepath);
		if (!scriptSetupBlock) {
			return;
		}
		const { lang } = scriptSetupBlock;
		virtualFileOrTsAst = program.getSourceFile(`${normalizedFilepath}.${lang}`);

		return virtualFileOrTsAst;
	}

	function traverseAst(ast: ts.SourceFile, cb: (node: ts.Node) => void): void {
		ts.forEachChild(ast, function traverse(node: ts.Node) {
			cb(node);
			ts.forEachChild(node, traverse);
		});
	}

	function findNodeByRange(
		ast: ts.SourceFile,
		filter: (ranges: vue.ScriptSetupRanges) => vue.TextRange | undefined,
	): ts.Node | undefined {
		const scriptSetupRanges = parseScriptSetupRanges(ast);
		const range = filter(scriptSetupRanges);
		if (!range) {
			return;
		}
		let node: ts.Node | undefined;
		traverseAst(ast, (n) => {
			if (n.getStart(ast) === range.start && n.getEnd() === range.end) {
				node = n;
			}
		});

		return node;
	}

	function findNodeByName(
		ast: ts.SourceFile,
		name: string,
	): ts.Node | undefined {
		let node: ts.Node | undefined;
		traverseAst(ast, (n) => {
			if (ts.isIdentifier(n) && n.getText(ast) === name) {
				node = n;
			}
		});

		return node;
	}

	return {
		parseScriptSetupRanges,
		getScriptSetupBlock,
		getScriptSetupAst,
		getVirtualFileOrTsAst,
		traverseAst,
		findNodeByRange,
		findNodeByName,
	};
}
