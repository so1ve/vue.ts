import ts from "typescript";

import { getLanguage } from "../language";
import type { Transformer } from "../types";

export const transformDefineEmits: Transformer = (printer, s, id) => {
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
};
