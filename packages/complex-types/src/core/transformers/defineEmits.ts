import { getLanguage } from "@vue.ts/language";
import ts from "typescript";

import type { Transformer } from "../types";

export const transformDefineEmits: Transformer = (printer, s, id) => {
	const language = getLanguage();
	const defineEmits = language.findNodeByRange(
		id,
		(scriptSetupRanges) => scriptSetupRanges.emits.define,
	);
	if (!defineEmits) {
		return;
	}

	const scriptSetupAst = language.getScriptSetupAst(id);

	const {
		scriptNode: defineEmitsNode,
		virtualFileNode: virtualFileDefineEmitsNode,
		offset,
	} = defineEmits;

	// TODO: refactor when https://github.com/vuejs/language-tools/pull/3710 is merged
	const defineEmitsTypeArg =
		ts.isCallExpression(virtualFileDefineEmitsNode) &&
		virtualFileDefineEmitsNode.typeArguments?.[0];

	const defineEmitsRuntimeArg =
		ts.isCallExpression(virtualFileDefineEmitsNode) &&
		virtualFileDefineEmitsNode.arguments[0];

	if (!defineEmitsTypeArg) {
		return;
	}

	if (defineEmitsRuntimeArg) {
		throw new Error(
			"[unplugin-vue-complex-types] `defineEmits` cannot accept both runtime argument and type argument.",
		);
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
