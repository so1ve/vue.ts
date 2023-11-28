import { join } from "node:path";

import ts from "typescript";

import type { Options, ResolvedOptions } from "./types";

export const resolveOptions = (rawOptions: Options): ResolvedOptions => ({
	include: rawOptions.include ?? ["**/*.vue", "**/*.tsx"],
	exclude: rawOptions.exclude ?? ["node_modules/**"],
	tsconfigPath: rawOptions.tsconfigPath ?? join(process.cwd(), "tsconfig.json"),
});

export const isFunction = (
	node: ts.Node,
): node is ts.ArrowFunction | ts.FunctionDeclaration | ts.FunctionExpression =>
	ts.isArrowFunction(node) ||
	ts.isFunctionDeclaration(node) ||
	ts.isFunctionExpression(node);

export function getNodeAssignNode(node: ts.Node) {
	let parent: ts.Node | null = null;
	let variableList: ts.VariableDeclarationList | null = null;
	let variable: ts.VariableDeclaration | null = null;

	while (node) {
		if (parent) {
			if (ts.isVariableDeclarationList(parent)) {
				variableList = parent;
			}
			if (ts.isVariableDeclaration(parent)) {
				variable = parent;
			}
		}
		parent = node;
		node = node.parent;
	}

	return { variableList, variable };
}
