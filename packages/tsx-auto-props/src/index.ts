import { ensureLanguage } from "@vue.ts/language";
import type { UnpluginFactory, UnpluginInstance } from "unplugin";
import { createUnplugin } from "unplugin";

import { transform } from "./core/transform";
import { resolveOptions } from "./core/utils";
import type { Options } from "./types";

export const unpluginFactory: UnpluginFactory<Options | undefined> = (
	options = {},
) => {
	const resolvedOptions = resolveOptions(options);

	return {
		name: "@vue.ts/tsx-auto-props",
		enforce: "pre",

		buildStart() {
			const resolvedOptions = resolveOptions(options);
			ensureLanguage(resolvedOptions.tsconfigPath);
		},

		transform: {
			filter: {
				id: {
					include: resolvedOptions.include,
					exclude: resolvedOptions.exclude,
				},
			},
			handler: transform,
		},
	};
};

export const unplugin: UnpluginInstance<Options | undefined> =
	/* #__PURE__ */ createUnplugin(unpluginFactory);

export default unplugin;
