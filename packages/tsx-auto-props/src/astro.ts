import type { Options } from "./types";
import vite from "./vite";

export default (options: Options) => ({
	name: "@vue.ts/complex-types",
	hooks: {
		"astro:config:setup": async (astro: any) => {
			astro.config.vite.plugins ??= [];
			astro.config.vite.plugins.push(vite(options));
		},
	},
});
