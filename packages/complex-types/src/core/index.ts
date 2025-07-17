import { createFilter } from "@vue.ts/shared";
import { ensureLanguage } from "@vue.ts/language";
import { createUnplugin } from "unplugin";

import { transform } from "./transform";
import type { Options } from "./types";
import { resolveOptions } from "./utils";

export default createUnplugin<Options | undefined>((options = {}) => ({
	name: "@vue.ts/complex-types",
	buildStart() {
		const resolvedOptions = resolveOptions(options);
		ensureLanguage(resolvedOptions.tsconfigPath);
	},
	transform(code, id) {
		const resolvedOptions = resolveOptions(options);
		const filter = createFilter(
			resolvedOptions.include,
			resolvedOptions.exclude,
		);

		if (!filter(id)) {
			return;
		}

		return transform(code, id, resolvedOptions);
	},
}));
