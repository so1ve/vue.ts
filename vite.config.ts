import TsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: { testTimeout: 50_000 },
	plugins: [TsconfigPaths()],
});
