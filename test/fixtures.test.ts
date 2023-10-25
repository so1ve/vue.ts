import { join } from "node:path";

import VueBetterDefine from "@vue-macros/better-define/rollup";
import {
	RollupEsbuildPlugin,
	RollupJson,
	RollupNodeResolve,
	RollupVue,
	rollupBuild,
	testFixtures,
} from "@vue-macros/test-utils";
import { describe } from "vitest";

import VueComplexTypes from "../src/rollup";

describe("fixtures", async () => {
	await testFixtures(
		["__fixtures__/*.vue"],
		(_args, id) =>
			rollupBuild(id, [
				VueComplexTypes({
					tsconfigPath: join(__dirname, "__fixtures__", "tsconfig.json"),
				}),
				VueBetterDefine(),
				RollupVue(),
				RollupJson(),
				RollupNodeResolve(),
				RollupEsbuildPlugin({
					target: "esnext",
				}),
			]),
		{
			cwd: __dirname,
			promise: true,
		},
	);
});
