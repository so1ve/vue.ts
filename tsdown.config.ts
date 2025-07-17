import { defineConfig } from "tsdown";

export default defineConfig({
	clean: true,
	external: [
		"@farmfe/core",
		"@nuxt/kit",
		"@nuxt/schema",
		"esbuild",
		"rolldown",
		"rollup",
		"typescript",
		"vite",
		"vue",
		"webpack",
	],
});
