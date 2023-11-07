import MagicString from "magic-string";
import ts from "typescript";
import type { TransformResult } from "unplugin";

import { getLanguage } from "./language";
import { Printer } from "./printer";
import type { TransformOptions } from "./types";

function transformDefineProps(printer: Printer, s: MagicString, id: string) {
	const language = getLanguage();
	const definePropsTypeArg = language.findNode(
		id,
		(scriptSetupRanges) => scriptSetupRanges.props.define?.typeArg,
	);

	if (!definePropsTypeArg) {
		return;
	}

	const { virtualFileNode: typeArgNode, setupRange: typeArgRange } =
		definePropsTypeArg;

	const printedType = printer.printTypeArg(typeArgNode);

	s.overwrite(typeArgRange.start, typeArgRange.end, printedType);
}

function transformDefineEmits(printer: Printer, s: MagicString, id: string) {
	const language = getLanguage();
	const defineEmits = language.findNode(
		id,
		(scriptSetupRanges) => scriptSetupRanges.emits.define,
	);
	if (!defineEmits) {
		return;
	}

	const {
		scriptNode: defineEmitsNode,
		virtualFileNode: virtualFileDefineEmitsNode,
		scriptSetupAst,
		offset,
	} = defineEmits;

	// TODO: refactor when https://github.com/vuejs/language-tools/pull/3710 is merged
	const defineEmitsTypeArg =
		virtualFileDefineEmitsNode &&
		ts.isCallExpression(virtualFileDefineEmitsNode) &&
		virtualFileDefineEmitsNode.typeArguments?.[0];

	if (!defineEmitsTypeArg) {
		return;
	}

	const tokens = defineEmitsNode.getChildren(scriptSetupAst);

	// defineEmits<     Arg   >()
	//            ^           ^
	const lessThanToken = tokens.find(
		(t) => t.kind === ts.SyntaxKind.LessThanToken,
	);
	const greaterThanToken = tokens.find(
		(t) => t.kind === ts.SyntaxKind.GreaterThanToken,
	);
	// defineEmits<     Arg   >()
	//                         ^
	const openParenToken = tokens.find(
		(t) => t.kind === ts.SyntaxKind.OpenParenToken,
	);

	if (!lessThanToken || !greaterThanToken || !openParenToken) {
		return;
	}

	const defineEmitsTypeArgRange = [
		offset + lessThanToken.pos,
		offset + greaterThanToken.end,
	] as const;
	const runtimeArgPos = offset + openParenToken.end;

	const printedRuntimeArg = printer.printEventsRuntimeArg(defineEmitsTypeArg);

	// Remove the type argument
	s.remove(...defineEmitsTypeArgRange);
	// Append the runtime argument
	s.appendRight(runtimeArgPos, printedRuntimeArg);
}

export function transform(
	code: string,
	id: string,
	options: TransformOptions,
): TransformResult {
	const s = new MagicString(code);
	const language = getLanguage();
	const typeChecker = language.__internal__.typeChecker;
	const printer = new Printer(typeChecker);
	if (options.defineProps) {
		transformDefineProps(printer, s, id);
	}
	if (options.defineEmits) {
		transformDefineEmits(printer, s, id);
	}

	return {
		code: s.toString(),
		map: s.generateMap({ hires: true }),
	};
}
