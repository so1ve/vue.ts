import type { BaseOptions } from "@vue.ts/common";

export interface Options extends BaseOptions {
	tsconfigPath?: string;
}

export type ResolvedOptions = Required<Options>;
