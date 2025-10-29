import { ensureLanguage } from "@vue.ts/language";
import { createFilter } from "@vue.ts/shared";
import type { UnpluginFactory } from "unplugin";
import { createUnplugin } from "unplugin";

import { transform } from "./core/transform";
import type { Options } from "./core/types";
import { resolveOptions } from "./core/utils";

export const unpluginFactory: UnpluginFactory<Options | undefined> = (
	options = {},
) => {
	const resolvedOptions = resolveOptions(options);
	const filter = createFilter(resolvedOptions.include, resolvedOptions.exclude);

	return {
		name: "@vue.ts/complex-types",
		enforce: "pre",

		buildStart() {
			const resolvedOptions = resolveOptions(options);
			ensureLanguage(resolvedOptions.tsconfigPath);
		},

		transform(code, id) {
			if (!filter(id)) {
				return;
			}

			return transform(code, id, resolvedOptions);
		},
	};
};

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory);

export default unplugin;
