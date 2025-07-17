import type { BaseOptions } from "@vue.ts/shared";

export interface Options extends BaseOptions {
	tsconfigPath?: string;
}

export type ResolvedOptions = Required<Options>;
