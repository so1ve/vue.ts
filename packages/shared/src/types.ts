import type { FilterPattern } from "unplugin";

export interface BaseOptions {
	include?: FilterPattern;
	exclude?: FilterPattern;
}
