import { createOptionsResolver } from "@vue.ts/shared";
import ts from "typescript";

import type { Options, ResolvedOptions } from "./types";

const defaultOptions: ResolvedOptions = {
	root: process.cwd(),
	include: ["**/*.vue", "**/*.tsx"],
	exclude: ["node_modules/**"],
	tsconfigPath: "tsconfig.json",
};

export const resolveOptions: (options: Options) => ResolvedOptions =
	createOptionsResolver(defaultOptions);

export function getNodeAssignNode(node: ts.Node): {
	variableList: ts.VariableDeclarationList | null;
	variable: ts.VariableDeclaration | null;
} {
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
