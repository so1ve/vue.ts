import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { transform } from "../src/core/transform";
import AVue from "./__fixtures__/a.vue?raw";

describe("should", () => {
	it("exported", () => {
		expect(
			transform(AVue, join(__dirname, "__fixtures__", "a.vue")),
		).toMatchSnapshot();
	});
});
