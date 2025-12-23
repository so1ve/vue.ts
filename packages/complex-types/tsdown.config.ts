import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/*.ts", "!src/types.ts"],
});
