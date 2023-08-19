import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
	clean: true,
	externals: [
		"@nuxt/schema",
		"@nuxt/kit",
		"webpack",
		"rollup",
		"vite",
		"esbuild",
		"rspack",
	],
});
