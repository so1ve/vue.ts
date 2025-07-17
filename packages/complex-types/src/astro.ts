import { createVitePlugin } from "unplugin";

import type { Options } from "./core/types";
import { unpluginFactory } from ".";

export default (options: Options) => ({
	name: "@vue.ts/complex-types",
	hooks: {
		"astro:config:setup": async (astro: any) => {
			astro.config.vite.plugins ??= [];
			astro.config.vite.plugins.push(
				createVitePlugin(unpluginFactory)(options),
			);
		},
	},
});
