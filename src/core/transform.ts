import MagicString from "magic-string";
import type { TransformResult } from "unplugin";
import { parse } from "vue/compiler-sfc";

export function transform(code: string): TransformResult {
	const s = new MagicString(code);
	const parsed = parse(code);
	if (parsed.descriptor.scriptSetup?.lang !== "ts") {
	}

	return {
		code: s.toString(),
		map: s.generateMap({ hires: true }),
	};
}
