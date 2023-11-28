import { getLanguage } from "@vue.ts/language";
import MagicString from "magic-string";
import ts from "typescript";
import type { TransformResult } from "unplugin";

import { getNodeAssignNode, isFunction } from "./utils";

const generateDefineProps = (name: string, props: string[]) =>
	`\n;Object.defineProperty(${name}, "props", {
  value: ${JSON.stringify(props)},
});`;

const DEFINE_COMPONENT = "defineComponent";

export function transform(code: string, id: string): TransformResult {
	const s = new MagicString(code);
	const language = getLanguage();
	const typeChecker = language.__internal__.typeChecker;

	language.traverseAst(
		id,
		(node, { virtualFileOrTsAst: ast, scriptSetupAst, isVirtualOrTsFile }) => {
			if (isVirtualOrTsFile && ts.isCallExpression(node)) {
				const identifier = node.expression;
				const symbol = typeChecker.getSymbolAtLocation(identifier);
				// This is a `defineComponent` call...
				if (
					symbol?.declarations?.some(
						(d) =>
							ts.isImportSpecifier(d) &&
							(d.propertyName ?? d.name)?.escapedText === DEFINE_COMPONENT,
					)
				) {
					const arg = node.arguments[0];
					if (arg) {
						const argType = typeChecker.getTypeAtLocation(arg);
						// defineComponent((props: Props) => { /* ... */ })
						if (isFunction(arg)) {
							const props = arg.parameters[0];
							if (props) {
								const propsList = typeChecker
									.getTypeAtLocation(arg.parameters[0])
									.getProperties()
									.map((p) => p.name);
								const { variableList, variable } = getNodeAssignNode(node);

								if (variableList && variable) {
									s.appendRight(
										variableList.getEnd() + 1,
										generateDefineProps(variable.name.getText(ast), propsList),
									);
								}
							}
						}
					}
				}
			}
		},
	);

	return {
		code: s.toString(),
		map: s.generateMap({ hires: true }),
	};
}
