import * as ts from "typescript";

export class Printer {
	constructor(private checker: ts.TypeChecker) {}

	private depth = 0;

	private printIntersectionTypeNode(node: ts.IntersectionTypeNode): string {
		return node.types.map((t) => this.print(t)).join(" & ");
	}

	private printUnionTypeNode(node: ts.UnionTypeNode): string {
		return node.types.map((t) => this.print(t)).join(" | ");
	}

	private printTypeLiteralNode(node: ts.TypeLiteralNode): string {
		return ["{", node.members.map((m) => this.print(m)).join(";\n"), "}"].join(
			"\n",
		);
	}

	private printPropertySignature(node: ts.PropertySignature): string {
		return [
			node.name.getText(),
			node.questionToken ? "?" : "",
			": ",
			node.type ? this.print(node.type) : "any",
		].join("");
	}

	private printIndexSignature(node: ts.IndexSignatureDeclaration): string {
		return "";
	}

	private printMappedTypeNode(node: ts.MappedTypeNode): string {
		const type = this.checker.getTypeAtLocation(node);
		const properties = type.getProperties();
		const parts = ["{"];

		for (const property of properties) {
			const valueType = this.checker.getTypeOfSymbol(property);
			// this.findNodeOfType(node, valueType);
			// TODO
			parts.push(`${this.checker.symbolToString(property)}: `);
		}

		parts.push("}");

		return parts.join("\n");
	}

	// private findNodeOfType(parent: ts.Node, type: ts.Type): ts.Node {
	// 	let found!: ts.Node;
	// 	const typeChecker = this.checker;
	// 	ts.forEachChild(parent, function visit(node) {
	// 		if (typeChecker.getTypeAtLocation(node) === type) {
	// 			found = node;
	// 		}
	// 		ts.forEachChild(node, visit);
	// 	});

	// 	return found;
	// }

	public print(node: ts.Node): string {
		if (ts.isIntersectionTypeNode(node)) {
			return this.printIntersectionTypeNode(node);
		} else if (ts.isUnionTypeNode(node)) {
			return this.printUnionTypeNode(node);
		} else if (ts.isTypeLiteralNode(node)) {
			return this.printTypeLiteralNode(node);
		} else if (ts.isPropertySignature(node)) {
			return this.printPropertySignature(node);
		} else if (ts.isIndexSignatureDeclaration(node)) {
			return this.printIndexSignature(node);
		} else if (ts.isMappedTypeNode(node)) {
			return this.printMappedTypeNode(node);
		} else {
			return `/* <NotHandled> */ ${node.getText()} /* </NotHandled> */`;
		}
	}
}
