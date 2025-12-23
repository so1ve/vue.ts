import { getLanguage } from "@vue.ts/language";
import type { SourceMap } from "magic-string";
import MagicString from "magic-string";
import type { TransformResult } from "unplugin";

import { Printer } from "./printer";
import { getTransformers } from "./transformers";
import type { TransformOptions } from "./types";

export function transform(
	code: string,
	id: string,
	options: TransformOptions,
): {
	code: string;
	map: SourceMap;
} {
	const s = new MagicString(code);
	const language = getLanguage();
	const checker = language.tsLs.getProgram()!.getTypeChecker();
	const printer = new Printer(checker);
	const transformers = getTransformers(options);

	for (const [, transform] of transformers) {
		transform(printer, s, id);
	}

	return {
		code: s.toString(),
		map: s.generateMap({ hires: true }),
	} satisfies TransformResult;
}
