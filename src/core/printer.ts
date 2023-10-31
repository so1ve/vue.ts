import * as ts from "typescript";

export class Printer {
	constructor(private checker: ts.TypeChecker) {}

	private getBaseType(nodeOrType: ts.Node | ts.Type): ts.Type {
		// It is a node
		if ("kind" in nodeOrType) {
			nodeOrType = this.checker.getTypeAtLocation(nodeOrType);
		}

		return (
			this.checker.getBaseConstraintOfType(nodeOrType) ??
			this.checker.getBaseTypeOfLiteralType(nodeOrType)
		);
	}

	private printIntersectionTypeNode(node: ts.IntersectionTypeNode): string {
		return node.types.map((t) => this.print(t)).join(" & ");
	}

	private printUnionTypeNode(node: ts.UnionTypeNode): string {
		return node.types.map((t) => this.print(t)).join(" | ");
	}

	private printTypeLiteralNode(node: ts.TypeLiteralNode): string {
		const parts = ["{"];

		for (const member of node.members) {
			if (ts.isPropertySignature(member)) {
				const stringBaseType = member.type
					? this.checker.typeToString(this.getBaseType(member.type))
					: "any";

				parts.push(
					[
						member.name.getText(),
						member.questionToken?.getText(),
						": ",
						stringBaseType,
					]
						.filter(Boolean)
						.join(""),
				);
			}
		}

		parts.push("}");

		return parts.join("\n");
	}

	private printByType(node: ts.Node): string {
		const type = this.checker.getTypeAtLocation(node);
		const properties = type.getProperties();
		const parts = ["{"];
		let questionToken = "";
		if (ts.isMappedTypeNode(node)) {
			questionToken = node.questionToken?.getText() ?? "";
		}
		for (const property of properties) {
			const valueType = this.checker.getTypeOfSymbol(property);
			const stringValueType = this.checker.typeToString(
				this.getBaseType(valueType),
			);
			parts.push(
				`${this.checker.symbolToString(
					property,
				)}${questionToken}: ${stringValueType}`,
			);
		}

		parts.push("}");

		return parts.join("\n");
	}

	public print(node: ts.Node): string {
		// Intersection and Union
		if (ts.isIntersectionTypeNode(node)) {
			return this.printIntersectionTypeNode(node);
		} else if (ts.isUnionTypeNode(node)) {
			return this.printUnionTypeNode(node);
		}
		// Type Literal and Mapped Type
		else if (ts.isTypeLiteralNode(node)) {
			return this.printTypeLiteralNode(node);
		}
		// Mapped Type and Type Reference
		else if (ts.isMappedTypeNode(node) || ts.isTypeReferenceNode(node)) {
			return this.printByType(node);
		}
		// Fallback
		else {
			console.error(
				`[unplugin-vue-complex-types] \`${
					ts.SyntaxKind[node.kind]
				}\` is not supported.`,
			);

			return node.getText();
		}
	}
}
