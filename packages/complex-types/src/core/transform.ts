import { getLanguage } from "@vue.ts/language";
import MagicString from "magic-string";
import type { TransformResult } from "unplugin";

import { Printer } from "./printer";
import { getTransformers } from "./transformers";
import type { TransformOptions } from "./types";

export function transform(
	code: string,
	id: string,
	options: TransformOptions,
): TransformResult {
	const s = new MagicString(code);
	const language = getLanguage();
	const typeChecker = language.__internal__.typeChecker;
	const printer = new Printer(typeChecker);
	const transformers = getTransformers(options);

	for (const [, transform] of transformers) {
		transform(printer, s, id);
	}

	return {
		code: s.toString(),
		map: s.generateMap({ hires: true }),
	};
}
