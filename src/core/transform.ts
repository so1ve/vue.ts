import MagicString from "magic-string";
import type { TransformResult } from "unplugin";

import { getLanguage } from "./language";

export function transform(code: string, id: string): TransformResult {
	const language = getLanguage();
	const s = new MagicString(code);
	const typeChecker = language.__internal__.typeChecker;
	const propsTypeArg = language.findDefinePropsTypeArg(id);

	if (!propsTypeArg) {
		return;
	}

	const { type: propType, range: propTypeRange } = propsTypeArg;

	return {
		code: s.toString(),
		map: s.generateMap({ hires: true }),
	};
}
