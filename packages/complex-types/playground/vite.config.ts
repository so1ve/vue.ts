import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import Vue from "@vitejs/plugin-vue";
import ComplexTypes from "@vue.ts/complex-types/vite";
import { defineConfig } from "vite";
import Inspect from "vite-plugin-inspect";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		Vue(),
		ComplexTypes({
			root: __dirname,
			tsconfigPath: "./tsconfig.app.json",
		}) as any,
		Inspect(),
	],
});
