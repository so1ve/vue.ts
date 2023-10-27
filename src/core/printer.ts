import * as ts from "typescript";

export class Printer {
	constructor(private typeChecker: ts.TypeChecker) {}

	private printIntersectionTypeNode(node: ts.IntersectionTypeNode) {
		return node.types.map(this.print.bind(this)).join(" & ");
	}

	private printUnionTypeNode(node: ts.UnionTypeNode) {
		return node.types.map(this.print.bind(this)).join(" | ");
	}

	private printTypeLiteralNode(node: ts.TypeLiteralNode) {
		return "";
	}

	print(node: ts.Node): string {
		if (ts.isIntersectionTypeNode(node)) {
			return this.printIntersectionTypeNode(node);
		} else if (ts.isUnionTypeNode(node)) {
			return this.printUnionTypeNode(node);
		} else if (ts.isTypeLiteralNode(node)) {
			return this.printTypeLiteralNode(node);
		}

		return "";
	}
}
