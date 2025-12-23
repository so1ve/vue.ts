import type { AstroIntegration } from "astro";

import type { Options } from "./types";
import vite from "./vite";

export default (options: Options): AstroIntegration => ({
	name: "@vue.ts/tsx-auto-props",
	hooks: {
		"astro:config:setup": async (astro) => {
			astro.config.vite.plugins ??= [];
			astro.config.vite.plugins.push(vite(options) as any);
		},
	},
});
