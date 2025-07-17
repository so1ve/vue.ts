import { normalizePath } from "@vue.ts/common";
import { getLanguage } from "@vue.ts/language";
import ts from "typescript";

import type { Transformer } from "../types";

export const transformDefineEmits: Transformer = (printer, s, id) => {
	const normalizedFilepath = normalizePath(id);

	const language = getLanguage();
	const scriptSetupBlock = language.getScriptSetupBlock(normalizedFilepath);
	const scriptSetupAst = language.getScriptSetupAst(normalizedFilepath);
	const virtualFileAst = language.getVirtualFileOrTsAst(normalizedFilepath);
	if (!scriptSetupBlock || !scriptSetupAst || !virtualFileAst) {
		return;
	}
	const scriptSetupNode = language.findNodeByRange(
		scriptSetupAst,
		(scriptSetupRanges) => scriptSetupRanges.defineEmits?.callExp,
	);
	const virtualFileNode = language.findNodeByRange(
		virtualFileAst,
		(scriptSetupRanges) => scriptSetupRanges.defineEmits?.callExp,
	);
	if (!scriptSetupNode || !virtualFileNode) {
		return;
	}

	const offset = scriptSetupBlock.startTagEnd;

	const defineEmitsTypeArg =
		ts.isCallExpression(virtualFileNode) && virtualFileNode.typeArguments?.[0];
	if (!defineEmitsTypeArg) {
		return;
	}

	const defineEmitsRuntimeArg =
		ts.isCallExpression(virtualFileNode) && virtualFileNode.arguments[0];

	if (defineEmitsRuntimeArg) {
		throw new Error(
			"[@vue.ts/complex-types] `defineEmits` cannot accept both runtime argument and type argument.",
		);
	}

	const tokens = scriptSetupNode.getChildren(scriptSetupAst);

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
