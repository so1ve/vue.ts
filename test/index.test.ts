import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { transform } from "../src/core/transform";
import AVue from "./__fixtures__/a.vue?raw";

const normalizeContent = (content: string) => content.replace(/\r\n/g, "\n");

describe("should", () => {
	it("exported", () => {
		expect(
			transform(
				normalizeContent(AVue),
				join(__dirname, "__fixtures__", "a.vue"),
			),
		).toMatchSnapshot();
	});
});
