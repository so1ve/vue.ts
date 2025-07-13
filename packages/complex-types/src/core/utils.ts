import { join } from "node:path";

import type { Options, ResolvedOptions } from "./types";

export const resolveOptions = (rawOptions: Options): ResolvedOptions => ({
	include: rawOptions.include ?? ["**/*.vue"],
	exclude: rawOptions.exclude ?? ["node_modules/**"],
	tsconfigPath: rawOptions.tsconfigPath ?? join(process.cwd(), "tsconfig.json"),
	defineEmits: rawOptions.defineEmits ?? true,
	defineProps: rawOptions.defineProps ?? true,
});

const quotesReg = /"/g;
export const escapeQuotes = (s: string) => s.replace(quotesReg, '\\"');
