import ts from "typescript";

import { escapeQuotes } from "./utils";

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
					? this.checker.typeToString(
							this.getBaseType(member.type),
							undefined,
							ts.TypeFormatFlags.NoTruncation,
						)
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

	private printTypeByType(node: ts.Node): string {
		const type = this.checker.getTypeAtLocation(node);
		const properties = type.getProperties();
		const parts = ["{"];
		const isMapped = ts.isMappedTypeNode(node);
		for (const property of properties) {
			const questionToken = isMapped
				? (node.questionToken?.getText() ?? "")
				: property.flags & ts.SymbolFlags.Optional
					? "?"
					: "";

			const valueType = this.checker.getTypeOfSymbol(property);
			const stringValueType = this.checker.typeToString(
				this.getBaseType(valueType),
				undefined,
				ts.TypeFormatFlags.NoTruncation,
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

	private printIdentifier(node: ts.Identifier) {
		const symbol = this.checker.getSymbolAtLocation(node);
		if (!symbol) {
			return node.getText();
		}

		const declarations = symbol.getDeclarations();
		if (!declarations || declarations.length === 0) {
			return node.getText();
		}

		return this.print(declarations[0]);
	}

	private printInterfaceDeclaration(node: ts.InterfaceDeclaration): string {
		const parts = ["{"];

		for (const member of node.members) {
			if (ts.isPropertySignature(member)) {
				const stringBaseType = member.type ? this.print(member.type) : "any";

				parts.push(
					[
						member.name?.getText(),
						member.questionToken?.getText(),
						": ",
						stringBaseType,
					]
						.filter(Boolean)
						.join(""),
				);
			} else if (ts.isMethodSignature(member)) {
				const signature = this.checker.getSignatureFromDeclaration(member);
				const returnType = signature
					? this.checker.typeToString(
							signature.getReturnType(),
							undefined,
							ts.TypeFormatFlags.NoTruncation,
						)
					: "any";

				const parameters = member.parameters
					.map((param) => {
						const paramType = param.type
							? this.checker.typeToString(
									this.getBaseType(param.type),
									undefined,
									ts.TypeFormatFlags.NoTruncation,
								)
							: "any";

						return `${param.name.getText()}: ${paramType}`;
					})
					.join(", ");

				parts.push(`${member.name?.getText()}(${parameters}): ${returnType}`);
			}
		}

		parts.push("}");

		let result = parts.join("\n");
		if (node.heritageClauses && node.heritageClauses.length > 0) {
			result = node.heritageClauses
				.map((clause) => this.print(clause))
				.join(" & ");
		}

		return result;
	}

	private printEnumDeclaration(node: ts.EnumDeclaration): string {
		const parts = ["{"];

		for (const member of node.members) {
			const name = member.name.getText();
			if (member.initializer) {
				const value = member.initializer.getText();
				parts.push(`${name}: ${value}`);
			} else {
				// Auto-incrementing enum member
				parts.push(`${name}: number`);
			}
		}

		parts.push("}");

		return parts.join("\n");
	}

	private printClassDeclaration(node: ts.ClassDeclaration): string {
		const parts = ["{"];

		for (const member of node.members) {
			if (ts.isPropertyDeclaration(member)) {
				const name = member.name?.getText();
				const typeAnnotation = member.type
					? this.checker.typeToString(
							this.getBaseType(member.type),
							undefined,
							ts.TypeFormatFlags.NoTruncation,
						)
					: "any";
				const optional = member.questionToken ? "?" : "";
				parts.push(`${name}${optional}: ${typeAnnotation}`);
			} else if (ts.isMethodDeclaration(member)) {
				const name = member.name?.getText();
				const signature = this.checker.getSignatureFromDeclaration(member);
				const returnType = signature
					? this.checker.typeToString(
							signature.getReturnType(),
							undefined,
							ts.TypeFormatFlags.NoTruncation,
						)
					: "any";

				const parameters = member.parameters
					.map((param) => {
						const paramType = param.type
							? this.checker.typeToString(
									this.getBaseType(param.type),
									undefined,
									ts.TypeFormatFlags.NoTruncation,
								)
							: "any";

						return `${param.name.getText()}: ${paramType}`;
					})
					.join(", ");

				parts.push(`${name}(${parameters}): ${returnType}`);
			} else if (ts.isConstructorDeclaration(member)) {
				const parameters = member.parameters
					.map((param) => {
						const paramType = param.type
							? this.checker.typeToString(
									this.getBaseType(param.type),
									undefined,
									ts.TypeFormatFlags.NoTruncation,
								)
							: "any";

						return `${param.name.getText()}: ${paramType}`;
					})
					.join(", ");

				parts.push(`constructor(${parameters}): void`);
			}
		}

		parts.push("}");

		return parts.join("\n");
	}

	private printFunctionTypeNode(node: ts.FunctionTypeNode): string {
		const parameters = node.parameters
			.map((param) => {
				const paramType = param.type ? this.print(param.type) : "any";
				const optional = param.questionToken ? "?" : "";
				const rest = param.dotDotDotToken ? "..." : "";

				return `${rest}${param.name.getText()}${optional}: ${paramType}`;
			})
			.join(", ");

		const returnType = node.type ? this.print(node.type) : "any";

		return `(${parameters}) => ${returnType}`;
	}

	private printConstructorTypeNode(node: ts.ConstructorTypeNode): string {
		const parameters = node.parameters
			.map((param) => {
				const paramType = param.type ? this.print(param.type) : "any";
				const optional = param.questionToken ? "?" : "";
				const rest = param.dotDotDotToken ? "..." : "";

				return `${rest}${param.name.getText()}${optional}: ${paramType}`;
			})
			.join(", ");

		const returnType = node.type ? this.print(node.type) : "any";

		return `new (${parameters}) => ${returnType}`;
	}

	private printTypeQueryNode(node: ts.TypeQueryNode): string {
		const exprName = node.exprName.getText();

		return `typeof ${exprName}`;
	}

	private printArrayTypeNode(node: ts.ArrayTypeNode): string {
		return `${this.print(node.elementType)}[]`;
	}

	private printTupleTypeNode(node: ts.TupleTypeNode): string {
		const elements = node.elements.map((element) => {
			if (ts.isRestTypeNode(element)) {
				return `...${this.print(element.type)}`;
			}
			if (ts.isOptionalTypeNode(element)) {
				return `${this.print(element.type)}?`;
			}
			if (ts.isNamedTupleMember(element)) {
				const type = this.print(element.type);
				const optional = element.questionToken ? "?" : "";
				const rest = element.dotDotDotToken ? "..." : "";

				return `${rest}${element.name.getText()}${optional}: ${type}`;
			}

			return this.print(element);
		});

		return `[${elements.join(", ")}]`;
	}

	private printConditionalTypeNode(node: ts.ConditionalTypeNode): string {
		const checkType = this.print(node.checkType);
		const extendsType = this.print(node.extendsType);
		const trueType = this.print(node.trueType);
		const falseType = this.print(node.falseType);

		return `${checkType} extends ${extendsType} ? ${trueType} : ${falseType}`;
	}

	private printIndexedAccessTypeNode(node: ts.IndexedAccessTypeNode): string {
		const objectType = this.print(node.objectType);
		const indexType = this.print(node.indexType);

		return `${objectType}[${indexType}]`;
	}

	private printHeritageClause(node: ts.HeritageClause): string {
		if (node.token === ts.SyntaxKind.ExtendsKeyword) {
			const parts = [];

			for (const type of node.types) {
				if (ts.isExpressionWithTypeArguments(type)) {
					parts.push(this.print(type.expression));
				}
			}

			return parts.join(" & ");
		}

		return "";
	}

	private printImportSpecifier(node: ts.ImportSpecifier): string {
		const name = node.propertyName
			? node.propertyName.getText()
			: node.name.getText();
		const symbol = this.checker.getSymbolAtLocation(node.name);
		if (!symbol) {
			return name;
		}

		const aliasedSymbol = this.checker.getAliasedSymbol(symbol);
		const targetSymbol = aliasedSymbol || symbol;

		const declarations = targetSymbol.getDeclarations();
		if (!declarations || declarations.length === 0) {
			return name;
		}

		const declaration = declarations.find(
			(decl) =>
				ts.isTypeAliasDeclaration(decl) ||
				ts.isInterfaceDeclaration(decl) ||
				ts.isClassDeclaration(decl) ||
				ts.isEnumDeclaration(decl) ||
				ts.isVariableDeclaration(decl),
		);
		if (declaration) {
			return this.print(declaration);
		}

		return name;
	}

	private isKeywordTypeNode(node: ts.Node): boolean {
		return (
			node.kind === ts.SyntaxKind.StringKeyword ||
			node.kind === ts.SyntaxKind.NumberKeyword ||
			node.kind === ts.SyntaxKind.BooleanKeyword ||
			node.kind === ts.SyntaxKind.ObjectKeyword ||
			node.kind === ts.SyntaxKind.UndefinedKeyword ||
			node.kind === ts.SyntaxKind.NullKeyword ||
			node.kind === ts.SyntaxKind.VoidKeyword ||
			node.kind === ts.SyntaxKind.AnyKeyword ||
			node.kind === ts.SyntaxKind.UnknownKeyword ||
			node.kind === ts.SyntaxKind.NeverKeyword ||
			node.kind === ts.SyntaxKind.SymbolKeyword ||
			node.kind === ts.SyntaxKind.BigIntKeyword
		);
	}

	public print(node: ts.Node): string {
		if (ts.isIdentifier(node)) {
			return this.printIdentifier(node);
		} else if (ts.isIntersectionTypeNode(node)) {
			return this.printIntersectionTypeNode(node);
		} else if (ts.isUnionTypeNode(node)) {
			return this.printUnionTypeNode(node);
		} else if (ts.isTypeLiteralNode(node)) {
			return this.printTypeLiteralNode(node);
		} else if (ts.isMappedTypeNode(node)) {
			return this.printTypeByType(node);
		} else if (ts.isTypeReferenceNode(node)) {
			return this.print(node.typeName);
		} else if (ts.isInterfaceDeclaration(node)) {
			return this.printInterfaceDeclaration(node);
		} else if (ts.isTypeAliasDeclaration(node)) {
			return node.type ? this.print(node.type) : "any";
		} else if (ts.isEnumDeclaration(node)) {
			return this.printEnumDeclaration(node);
		} else if (ts.isClassDeclaration(node)) {
			return this.printClassDeclaration(node);
		} else if (ts.isFunctionTypeNode(node)) {
			return this.printFunctionTypeNode(node);
		} else if (ts.isConstructorTypeNode(node)) {
			return this.printConstructorTypeNode(node);
		} else if (ts.isTypeQueryNode(node)) {
			return this.printTypeQueryNode(node);
		} else if (ts.isArrayTypeNode(node)) {
			return this.printArrayTypeNode(node);
		} else if (ts.isTupleTypeNode(node)) {
			return this.printTupleTypeNode(node);
		} else if (ts.isConditionalTypeNode(node)) {
			return this.printConditionalTypeNode(node);
		} else if (ts.isIndexedAccessTypeNode(node)) {
			return this.printIndexedAccessTypeNode(node);
		} else if (ts.isParenthesizedTypeNode(node)) {
			return this.print(node.type);
		} else if (ts.isHeritageClause(node)) {
			return this.printHeritageClause(node);
		} else if (ts.isTypeAliasDeclaration(node) && node.type) {
			return this.print(node.type);
		} else if (ts.isInterfaceDeclaration(node)) {
			return this.printInterfaceDeclaration(node);
		} else if (ts.isVariableDeclaration(node) && node.type) {
			return this.print(node.type);
		} else if (ts.isImportSpecifier(node)) {
			return this.printImportSpecifier(node);
		} else if (ts.isTypeParameterDeclaration(node)) {
			if (node.constraint) {
				return this.print(node.constraint);
			} else if (node.default) {
				return this.print(node.default);
			}

			return "{}";
		} else if (ts.isParameter(node) && node.type) {
			return this.print(node.type);
		} else if (
			ts.isLiteralTypeNode(node) ||
			ts.isThisTypeNode(node) ||
			this.isKeywordTypeNode(node)
		) {
			return node.getText();
		} else {
			console.error(
				`[@vue.ts/complex-types] \`${
					ts.SyntaxKind[node.kind]
				}\` is not supported.`,
			);

			return node.getText();
		}
	}

	private printEventsByCallSignatures(
		callSignatures: readonly ts.Signature[],
	): string[] {
		return callSignatures.map((c) => {
			const parameters = c.getParameters();
			const event = parameters[0];

			return this.checker.typeToString(
				this.checker.getTypeOfSymbol(event),
				undefined,
				ts.TypeFormatFlags.NoTruncation,
			);
		});
	}

	private printEventsByMembers(members: ts.Symbol[]): string[] {
		return members.map((m) => `"${escapeQuotes(m.getName())}"`);
	}

	public printEventsRuntimeArg(node: ts.Node): string {
		const parts: string[] = [];

		const type = this.checker.getTypeAtLocation(node);
		const callSignatures = type.getCallSignatures();
		const members = type.getProperties();

		if (callSignatures.length > 0 && members.length > 0) {
			// We cannot fallback here.
			throw new Error(
				"[@vue.ts/complex-types] You may not use old style `defineEmits` and `defineEmits` shorthand together.",
			);
		}

		if (members.length > 0) {
			parts.push(...this.printEventsByMembers(members));
		} else {
			parts.push(...this.printEventsByCallSignatures(callSignatures));
		}

		return `[${parts.join(", ")}]`;
	}
}
