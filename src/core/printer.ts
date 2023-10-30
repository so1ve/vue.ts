import * as ts from "typescript";

export class Printer {
	constructor(private typeChecker: ts.TypeChecker) {}

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
		const type = this.typeChecker.getTypeAtLocation(node);
		console.log(type.getProperties());

		return "";
	}

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
