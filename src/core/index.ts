import { createUnplugin } from "unplugin";

import type { Options } from "./types";

export default createUnplugin<Options | undefined>((_options) => ({
	name: "pkg-name",
	transform(code) {
		return code;
	},
}));
