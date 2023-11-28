import { getLanguage } from "@vue.ts/language";
import MagicString from "magic-string";
import ts from "typescript";
import type { TransformResult } from "unplugin";

const generateDefineProps = (name: string, props: string[]) =>
	`\nObject.defineProperty(${name}, "props", {
  value: ${JSON.stringify(props)},
});`;

export function transform(code: string, id: string): TransformResult {
	const s = new MagicString(code);
	const language = getLanguage();
	const typeChecker = language.__internal__.typeChecker;

	language.traverseAst(id, (node, { ast, isVirtualOrTsFile }) => {
		if (ts.isCallExpression(node)) {
			const identifier = node.expression;
			const symbol = typeChecker.getSymbolAtLocation(identifier);
			if (
				symbol?.declarations?.some(
					(d) =>
						ts.isImportSpecifier(d) &&
						(d.propertyName ?? d.name)?.escapedText === "defineComponent",
				)
			) {
			}
		}
	});

	return {
		code: s.toString(),
		map: s.generateMap({ hires: true }),
	};
}
