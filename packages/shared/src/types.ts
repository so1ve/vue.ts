import type { FilterPattern } from "@rollup/pluginutils";

export interface BaseOptions {
	include?: FilterPattern;
	exclude?: FilterPattern;
}
