import MagicString from "magic-string";
import type { TransformResult } from "unplugin";

import { getLanguage } from "./language";
import { Printer } from "./printer";

export function transform(code: string, id: string): TransformResult {
	const language = getLanguage();
	const s = new MagicString(code);
	const typeChecker = language.__internal__.typeChecker;
	const printer = new Printer(typeChecker);
	const definePropsTypeArg = language.findScriptRangesNode(
		id,
		(scriptSetupRanges) => scriptSetupRanges.props.define?.typeArg,
	);

	if (!definePropsTypeArg) {
		return;
	}

	const {
		node: typeArgNode,
		type: typeArgType,
		range: typeRange,
	} = definePropsTypeArg;

	const printedType = printer.print(typeArgNode);

	s.overwrite(typeRange.start, typeRange.end, printedType);

	return {
		code: s.toString(),
		map: s.generateMap({ hires: true }),
	};
}
