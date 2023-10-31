import { createUnplugin } from "unplugin";

import { ensureLanguage } from "./language";
import { transform } from "./transform";
import type { Options } from "./types";
import { resolveOptions } from "./utils";

export { ensureLanguage, getLanguage } from "./language";

export default createUnplugin<Options | undefined>((options = {}) => ({
	name: "unplugin-vue-complex-types",
	buildStart() {
		const resolvedOptions = resolveOptions(options);
		ensureLanguage(resolvedOptions.tsconfigPath);
	},
	transform(code, id) {
		if (!id.endsWith(".vue")) {
			return;
		}

		return transform(code, id);
	},
}));
