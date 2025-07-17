import { getLanguage } from "@vue.ts/language";
import { normalizePath } from "vite";

import type { Transformer } from "../types";

export const transformDefineProps: Transformer = (printer, s, id) => {
	const normalizedFilepath = normalizePath(id);

	const language = getLanguage();
	const scriptSetupBlock = language.getScriptSetupBlock(normalizedFilepath);
	const scriptSetupAst = language.getScriptSetupAst(normalizedFilepath);
	const virtualFileAst = language.getVirtualFileOrTsAst(normalizedFilepath);
	if (!scriptSetupBlock || !scriptSetupAst || !virtualFileAst) {
		return;
	}
	const scriptSetupDefinePropsTypeRange =
		language.parseScriptSetupRanges(scriptSetupAst).defineProps?.typeArg;
	const virtualFileDefinePropsTypeNode = language.findNodeByName(
		virtualFileAst,
		"__VLS_Props",
	);
	if (!scriptSetupDefinePropsTypeRange || !virtualFileDefinePropsTypeNode) {
		return;
	}

	const printedType = printer.printType(virtualFileDefinePropsTypeNode);
	const offset = scriptSetupBlock.startTagEnd;

	s.overwrite(
		offset + scriptSetupDefinePropsTypeRange.start,
		offset + scriptSetupDefinePropsTypeRange.end,
		printedType,
	);
};
