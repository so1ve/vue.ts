import { createUnplugin } from "unplugin";

import type { Options } from "./types";

export default createUnplugin<Options | undefined>((_options) => ({
	name: "unplugin-vue-complex-types",
	transform(code) {
		return code;
	},
}));
