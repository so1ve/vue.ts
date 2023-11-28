import TsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {},
	plugins: [TsconfigPaths()],
});
