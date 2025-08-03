import ts from "typescript";

import { escapeQuotes } from "./utils";

export class Printer {
	constructor(private checker: ts.TypeChecker) {}

	private typeToString(type: ts.Type): string {
		return this.checker.typeToString(
			type,
			undefined,
			ts.TypeFormatFlags.NoTruncation,
		);
	}

	private printUnionOrIntersection(
		type: ts.UnionOrIntersectionType,
		separator: string,
		inner: boolean,
	): string {
		return [
			...new Set(
				type.types.map((t) => this.printType(t, inner)).filter(Boolean),
			),
		].join(separator);
	}

	private containsUndefined(type: ts.Type): boolean {
		return type.isUnion()
			? type.types.some((t) => t.flags & ts.TypeFlags.Undefined)
			: !!(type.flags & ts.TypeFlags.Undefined);
	}

	private printConditionTypeNode(type: ts.ConditionalType) {
		const decl = type.root.node;
		const { trueType, falseType } = decl;
		const trueTypeNode = this.checker.getTypeAtLocation(trueType);
		const falseTypeNode = this.checker.getTypeAtLocation(falseType);

		return `${this.printType(trueTypeNode)} | ${this.printType(falseTypeNode)}`;
	}

	private printPrimitiveType(type: ts.Type): string {
		if (type.flags & ts.TypeFlags.BooleanLiteral) {
			return "boolean";
		} else if (type.flags & ts.TypeFlags.String || type.isStringLiteral()) {
			return "string";
		} else if (type.flags & ts.TypeFlags.Number || type.isNumberLiteral()) {
			return "number";
		} else if (type.flags & ts.TypeFlags.BigInt) {
			return "bigint";
		} else if (type.flags & ts.TypeFlags.Any) {
			return "any";
		} else if (type.flags & ts.TypeFlags.Unknown) {
			return "unknown";
		} else if (type.flags & ts.TypeFlags.Null) {
			return "null";
		}

		return "";
	}

	private printType(type: ts.Type, inner = false): string {
		if (type.isUnion()) {
			return this.printUnionOrIntersection(type, " | ", inner);
		} else if (type.isIntersection()) {
			return this.printUnionOrIntersection(type, " & ", inner);
		}
		if (this.checker.isArrayType(type)) {
			return "Array";
		} else if (type.flags & ts.TypeFlags.Object) {
			const decl = type.getSymbol()?.declarations?.[0];
			if (decl && ts.isFunctionTypeNode(decl)) {
				return "Function";
			}

			if (inner) {
				return "object";
			}

			const properties = type.getProperties();
			const props: Record<
				string,
				{
					value: string;
					isOptional: boolean;
				}
			> = {};
			for (const prop of properties) {
				const propType = this.checker.getTypeOfSymbol(prop);
				props[prop.getName()] = {
					value: this.printType(propType, true),
					isOptional: this.containsUndefined(propType),
				};
			}

			const parts: string[] = [];
			for (const [propName, { isOptional, value }] of Object.entries(props)) {
				const questionMark = isOptional ? "?" : "";
				parts.push(`"${escapeQuotes(propName)}"${questionMark}: ${value},`);
			}

			return Object.keys(props).length > 0 ? `{\n${parts.join("\n")}\n}` : "";
		} else if (
			type.isLiteral() ||
			type.flags & ts.TypeFlags.BooleanLiteral ||
			type.flags & ts.TypeFlags.String ||
			type.flags & ts.TypeFlags.Number ||
			type.flags & ts.TypeFlags.BigInt ||
			type.flags & ts.TypeFlags.Any ||
			type.flags & ts.TypeFlags.Unknown ||
			type.flags & ts.TypeFlags.Null
		) {
			return this.printPrimitiveType(type);
		} else if (type.flags & ts.TypeFlags.Undefined) {
			return "";
		} else if (type.flags & ts.TypeFlags.Conditional) {
			return this.printConditionTypeNode(type as ts.ConditionalType);
		} else if (type.isTypeParameter()) {
			const symbol = type.getSymbol();
			const decl = symbol?.declarations?.[0];
			if (!decl || !ts.isTypeParameterDeclaration(decl)) {
				return "";
			}
			const ref = ts.getEffectiveConstraintOfTypeParameter(decl);
			if (!ref) {
				return "";
			}
			const refType = this.checker.getTypeAtLocation(ref);

			return this.printType(refType);
		}

		return this.typeToString(type);
	}

	public printPropsTypeArg(node: ts.Node): string {
		const type = this.checker.getTypeAtLocation(node);

		return this.printType(type);
	}

	private printEventsByCallSignatures(
		callSignatures: readonly ts.Signature[],
	): string[] {
		return callSignatures.map((c) => {
			const parameters = c.getParameters();
			const event = parameters[0];

			return this.typeToString(this.checker.getTypeOfSymbol(event));
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
