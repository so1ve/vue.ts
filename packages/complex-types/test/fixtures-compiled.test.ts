import { join } from "node:path";

import VueBetterDefine from "@vue-macros/better-define/rollup";
import {
	RollupJson,
	RollupNodeResolve,
	RollupVue,
	RollupVueJsx,
	UnpluginOxc,
	rollupBuild,
	testFixtures,
} from "@vue-macros/test-utils";
import { describe } from "vitest";

import VueComplexTypes from "../src/rollup";

describe("fixtures compiled", async () => {
	await testFixtures(
		["__fixtures__/**/*.vue", "!__fixtures__/**/*.exclude.vue"],
		(_args, id) =>
			rollupBuild(id, [
				VueComplexTypes({
					tsconfigPath: join(__dirname, "__fixtures__", "tsconfig.json"),
				}),
				VueBetterDefine({ isProduction: false }),
				RollupVue(),
				RollupVueJsx(),
				RollupJson(),
				RollupNodeResolve(),
				UnpluginOxc.rollup(),
			]),
		{
			cwd: __dirname,
			promise: true,
		},
	);
});
