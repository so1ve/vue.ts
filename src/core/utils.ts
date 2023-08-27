import * as ts from "typescript";

export const normalizePath = (id: string) => id.replace(/\\/g, "/");

export const vueFilepathToVirtualFilepath = (filepath: string) =>
	filepath.replace(/\.vue$/, ".vue-complex-types.vue.ts");

export function getProgramAndSourceFile(code: string, id: string) {
	const sourceFile = ts.createSourceFile(id, code, ts.ScriptTarget.Latest);
	const defaultCompilerHost = ts.createCompilerHost(
		// TODO: receive a tsconfig
		{},
	);
	const customCompilerHost: ts.CompilerHost = {
		...defaultCompilerHost,
		getSourceFile: (name, languageVersion) => {
			if (vueFilepathToVirtualFilepath(name) === id) {
				return sourceFile;
			}

			return defaultCompilerHost.getSourceFile(name, languageVersion);
		},
	};
	const program = ts.createProgram([id], {}, customCompilerHost);

	return { program, sourceFile };
}

const vueAcceptableTypes = ["string", "number", "boolean", "bigint", "symbol"];
function toVueAcceptableType(typeString: string) {
	if (vueAcceptableTypes.includes(typeString)) {
		return typeString;
	}
	if (typeString.endsWith("[]")) {
		return "any[]";
	}

	return "object";
}

export function printVueAcceptableTypeLiteralFromSymbols(
	symbols: ts.Symbol[],
	typeChecker: ts.TypeChecker,
) {
	const codes = ["{"];
	function push(code: string) {
		codes.push(`  ${code}`);
	}
	for (const symbol of symbols) {
		for (const decl of symbol.getDeclarations() ?? []) {
			if (ts.isPropertySignature(decl)) {
				const type = typeChecker.getTypeAtLocation(decl);
				const typeString = typeChecker.typeToString(
					typeChecker.getBaseTypeOfLiteralType(type),
				);
				let questionMark = "";
				if (decl.questionToken) {
					questionMark = "?";
				}
				push(
					`${decl.name.getText()}${questionMark}: ${toVueAcceptableType(
						typeString,
					)};`,
				);
			}
		}
	}
	codes.push("}");

	return codes.join("\n");
}

export function findDefinePropsCall(node: ts.Node) {
	let definePropsCall: ts.CallExpression | undefined;
	function traverse(node: ts.Node) {
		if (
			ts.isCallExpression(node) &&
			node.expression.getText() === "defineProps" &&
			node.typeArguments?.length
		) {
			definePropsCall = node;
		}

		node.forEachChild(traverse);
	}
	traverse(node);

	return definePropsCall;
}
