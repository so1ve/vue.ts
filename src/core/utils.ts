import { join } from "node:path";

import type { Options } from "./types";

const windowsPathReg = /\\/g;
export const normalizePath = (id: string) => id.replace(windowsPathReg, "/");

export const resolveOptions = (rawOptions: Options): Required<Options> => ({
	tsconfigPath: rawOptions.tsconfigPath ?? join(process.cwd(), "tsconfig.json"),
});

const quotesReg = /"/g;
export const escapeQuotes = (s: string) => s.replace(quotesReg, '\\"');
