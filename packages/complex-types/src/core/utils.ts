import { createOptionsResolver } from "@vue.ts/shared";

import type { Options, ResolvedOptions } from "./types";

const defaultOptions: ResolvedOptions = {
	root: process.cwd(),
	include: ["**/*.vue"],
	exclude: ["node_modules/**"],
	tsconfigPath: "tsconfig.json",
	defineEmits: true,
	defineProps: true,
};

export const resolveOptions: (options: Options) => ResolvedOptions =
	createOptionsResolver(defaultOptions);

const quotesReg = /"/g;

export const escapeQuotes = (s: string): string => s.replace(quotesReg, '\\"');
