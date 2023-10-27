import { createUnplugin } from "unplugin";

import { ensureLanguage } from "./language";
import { transform } from "./transform";
import type { Options } from "./types";

export { ensureLanguage, getLanguage } from "./language";

export default createUnplugin<Options>((options) => ({
	name: "unplugin-vue-complex-types",
	buildStart() {
		ensureLanguage(options.tsconfigPath);
	},
	transform(code, id) {
		if (!id.endsWith(".vue")) {
			return;
		}

		return transform(code, id);
	},
}));
