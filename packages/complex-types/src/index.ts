import { ensureLanguage, getLanguage } from "@vue.ts/language";
import type { UnpluginFactory, UnpluginInstance } from "unplugin";
import { createUnplugin } from "unplugin";
import { createFilter } from "unplugin-utils";

import { transform } from "./core/transform";
import type { Options } from "./core/types";
import { resolveOptions } from "./core/utils";

const languageExtRegexp = /\.((?:c|m)?(?:j|t)sx?|d\.ts|vue)$/i;

export const unpluginFactory: UnpluginFactory<Options | undefined> = (
	options = {},
) => {
	const resolvedOptions = resolveOptions(options);
	const filter = createFilter(resolvedOptions.include, resolvedOptions.exclude);

	return {
		name: "@vue.ts/complex-types",
		enforce: "pre",

		vite: {
			async handleHotUpdate(ctx) {
				const { file } = ctx;
				if (!languageExtRegexp.test(file)) {
					return;
				}

				const language = getLanguage();
				const { read } = ctx;
				async function readAndUpdateLanguage() {
					const content = await read();
					language.updateFile(file, content);

					return content;
				}

				if (!filter(file)) {
					await readAndUpdateLanguage();

					return;
				}

				ctx.read = async () => {
					const code = await readAndUpdateLanguage();
					const result = transform(code, file, resolvedOptions);

					return result?.code ?? code;
				};

				const sfcModule = ctx.modules.find((mod) => mod.file === file);
				if (sfcModule) {
					return [sfcModule];
				}

				return ctx.modules;
			},
		},

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
			handler: (code, id) => transform(code, id, resolvedOptions),
		},
	};
};

export const unplugin: UnpluginInstance<Options | undefined> =
	/* #__PURE__ */ createUnplugin(unpluginFactory);

export default unplugin;
