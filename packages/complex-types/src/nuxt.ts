import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from "@nuxt/kit";
import type { ModuleDefinition } from "@nuxt/schema";

import { name, version } from "../package.json";
import type { Options } from "./core/types";
import VitePlugin from "./vite";
import WebpackPlugin from "./webpack";

export default defineNuxtModule<Options>({
	meta: {
		name,
		version,
		configKey: "complexTypes",
		compatibility: {
			bridge: true,
		},
	},
	defaults: {
		tsconfigPath: "tsconfig.json",
	},
	setup(options) {
		addVitePlugin(VitePlugin(options));
		addWebpackPlugin(WebpackPlugin(options));
	},
});
