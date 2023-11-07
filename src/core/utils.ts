import { join } from "node:path";

import type { Options, ResolvedOptions } from "./types";

const windowsPathReg = /\\/g;
export const normalizePath = (id: string) => id.replace(windowsPathReg, "/");

export const resolveOptions = (rawOptions: Options): ResolvedOptions => ({
	tsconfigPath: rawOptions.tsconfigPath ?? join(process.cwd(), "tsconfig.json"),
	defineEmits: rawOptions.defineEmits ?? true,
	defineProps: rawOptions.defineProps ?? true,
});

const quotesReg = /"/g;
export const escapeQuotes = (s: string) => s.replace(quotesReg, '\\"');
