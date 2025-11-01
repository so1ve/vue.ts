import { getLanguage } from "@vue.ts/language";
import { normalizePath } from "@vue.ts/shared";
import MagicString from "magic-string";
import ts from "typescript";
import type { TransformResult } from "unplugin";

import { getNodeAssignNode } from "./utils";

const generateDefineProps = (name: string, props: string[]) =>
	`\n;Object.defineProperty(${name}, "props", {
  value: ${JSON.stringify(props)},
});`;

const DEFINE_COMPONENT = "defineComponent";

export function transform(code: string, id: string): TransformResult {
	const s = new MagicString(code);
	const normalizedFilepath = normalizePath(id);
	const language = getLanguage();
	const checker = language.tsLs.getProgram()!.getTypeChecker();
	// This transform is supposed to be used in `.tsx` files not Vue SFCs.
	const ast = language.getVirtualFileOrTsAst(normalizedFilepath);
	if (!ast) {
		return;
	}

	language.traverseAst(ast, (node) => {
		if (!ts.isCallExpression(node)) {
			return;
		}
		const identifier = node.expression;
		const symbol = checker.getSymbolAtLocation(identifier);
		// This is a `defineComponent` call...
		if (
			symbol?.declarations?.some(
				(d) =>
					ts.isImportSpecifier(d) &&
					(d.propertyName ?? d.name)?.text === DEFINE_COMPONENT,
			)
		) {
			const arg = node.arguments[0];
			let setupFn: ts.FunctionLikeDeclaration | undefined;
			// defineComponent({
			//   setup: (props: Props) => { /* ... */ }
			// })
			if (ts.isObjectLiteralExpression(arg)) {
				const props = arg.properties.find(
					(p) =>
						ts.isPropertyAssignment(p) &&
						ts.isIdentifier(p.name) &&
						p.name.escapedText === "props",
				);
				const setup = arg.properties.find(
					(p) =>
						ts.isPropertyAssignment(p) &&
						ts.isIdentifier(p.name) &&
						p.name.escapedText === "setup",
				);
				if (!props && setup && ts.isPropertyAssignment(setup)) {
					const value = setup.initializer;
					if (ts.isFunctionLike(value)) {
						setupFn = value;
					}
				}
			}
			// defineComponent((props: Props) => { /* ... */ })
			else if (ts.isFunctionLike(arg)) {
				setupFn = arg;
			} else {
				throw new Error(
					"[@vue.ts/tsx-auto-props] Invalid defineComponent argument",
				);
			}
			const props = setupFn?.parameters[0];
			if (props) {
				const propsList = checker
					.getTypeAtLocation(props)
					.getProperties()
					.map((p) => p.name);
				const { variableList, variable } = getNodeAssignNode(node);

				if (propsList.length > 0 && variableList && variable) {
					s.appendRight(
						variableList.getEnd() + 1,
						generateDefineProps(variable.name.getText(ast), propsList),
					);
				}
			}
		}
	});

	return {
		code: s.toString(),
		map: s.generateMap({ hires: true }),
	};
}
