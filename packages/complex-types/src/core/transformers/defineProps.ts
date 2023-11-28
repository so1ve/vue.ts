import { getLanguage } from "@vue.ts/language";

import type { Transformer } from "../types";

export const transformDefineProps: Transformer = (printer, s, id) => {
	const language = getLanguage();
	const definePropsTypeArg = language.findNodeByRange(
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
};
