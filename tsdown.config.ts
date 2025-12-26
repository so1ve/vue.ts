import { defineConfig } from "tsdown";

export default defineConfig({
	workspace: {
		include: ["packages/*"],
	},
	entry: ["src/index.ts"],
	dts: {
		oxc: true,
	},
	exports: true,
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
