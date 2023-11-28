import { join } from "node:path";

import type { Options, ResolvedOptions } from "./types";

export const resolveOptions = (rawOptions: Options): ResolvedOptions => ({
	include: rawOptions.include ?? ["**/*.vue", "**/*.tsx"],
	exclude: rawOptions.exclude ?? ["node_modules/**"],
	tsconfigPath: rawOptions.tsconfigPath ?? join(process.cwd(), "tsconfig.json"),
});
