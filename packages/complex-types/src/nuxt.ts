import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from "@nuxt/kit";

import type { Options } from "./types";
import vite from "./vite";
import webpack from "./webpack";

export default defineNuxtModule<Options>({
	meta: {
		name: "@vue.ts/complex-types",
		configKey: "complexTypes",
	},
	defaults: {},
	setup(options, _nuxt) {
		addVitePlugin(() => vite(options));
		addWebpackPlugin(() => webpack(options));
	},
});
