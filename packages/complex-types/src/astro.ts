import type { AstroIntegration } from "astro";

import type { Options } from "./core/types";
import vite from "./vite";

export default (options: Options): AstroIntegration => ({
	name: "@vue.ts/complex-types",
	hooks: {
		"astro:config:setup": async (astro) => {
			astro.config.vite.plugins ??= [];
			astro.config.vite.plugins.push(vite(options) as any);
		},
	},
});
