import { createUnplugin } from "unplugin";

import { transform } from "./transform";
import type { Options } from "./types";

export default createUnplugin<Options | undefined>((_options) => ({
	name: "unplugin-vue-complex-types",
	transform(code) {
		return transform(code);
	},
}));
