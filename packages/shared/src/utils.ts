import { isAbsolute, join } from "node:path";

import type { BaseOptions } from "@vue.ts/shared";
import type { Defu } from "defu";
import { defu } from "defu";

const windowsPathReg = /\\/g;
export const normalizePath = (id: string): string =>
	id.replace(windowsPathReg, "/");

export const createOptionsResolver =
	<T extends Required<BaseOptions>>(defaultOptions: T) =>
	(rawOptions: Partial<T>): Defu<Partial<T>, [T]> => {
		const mergedOptions = defu(rawOptions, defaultOptions);
		if (!isAbsolute(mergedOptions.tsconfigPath)) {
			mergedOptions.tsconfigPath = join(
				mergedOptions.root,
				mergedOptions.tsconfigPath,
			);
		}

		return mergedOptions;
	};
