import { defineConfig } from "tsdown";

export default defineConfig({
	workspace: {
		include: ["packages/*"],
	},
	dts: {
		oxc: true,
	},
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
