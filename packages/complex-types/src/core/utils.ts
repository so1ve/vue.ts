import { join } from "node:path";

import { defu } from "defu";

import type { Options, ResolvedOptions } from "./types";

const defaultOptions: ResolvedOptions = {
	include: ["**/*.vue"],
	exclude: ["node_modules/**"],
	tsconfigPath: join(process.cwd(), "tsconfig.json"),
	defineEmits: true,
	defineProps: true,
};

export const resolveOptions = (rawOptions: Options) =>
	defu(rawOptions, defaultOptions) as ResolvedOptions;

const quotesReg = /"/g;
export const escapeQuotes = (s: string) => s.replace(quotesReg, '\\"');
