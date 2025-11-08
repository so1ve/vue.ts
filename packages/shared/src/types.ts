import type { FilterPattern } from "unplugin";

export interface BaseOptions {
	root?: string;
	tsconfigPath?: string;
	include?: FilterPattern;
	exclude?: FilterPattern;
}
