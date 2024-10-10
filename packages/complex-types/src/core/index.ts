import { createFilter } from "@vue.ts/common";
import { ensureLanguage } from "@vue.ts/language";
import { createUnplugin } from "unplugin";

import { transform } from "./transform";
import type { Options } from "./types";
import { resolveOptions } from "./utils";

export default createUnplugin<Options | undefined>((options = {}) => ({
	name: "@vue.ts/complex-types",
	enforce: 'pre',
	buildStart() {
		const resolvedOptions = resolveOptions(options);
		ensureLanguage(resolvedOptions.tsconfigPath);
	},
	transform(code, id) {
		const file = id.replace(/\?v=.*$/, '');
		const resolvedOptions = resolveOptions(options);
		const filter = createFilter(
			resolvedOptions.include,
			resolvedOptions.exclude,
		);

		if (!filter(file)) {
			return;
		}

		return transform(code, file, resolvedOptions);
	},
}));
