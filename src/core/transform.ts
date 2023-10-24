import MagicString from "magic-string";
import type { TransformResult } from "unplugin";

import { getLanguage } from "./language";

export function transform(code: string, id: string): TransformResult {
	const language = getLanguage();
	const s = new MagicString(code);
	const found = language.findDefinePropsTypeArg(id);
	console.log(found);

	return {
		code: s.toString(),
		map: s.generateMap({ hires: true }),
	};
}
