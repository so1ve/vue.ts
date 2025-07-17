import type { BaseOptions } from "@vue.ts/shared";
import type MagicString from "magic-string";

import type { Printer } from "./printer";

export type ValidTransforms = "defineEmits" | "defineProps";

export type Options = {
	tsconfigPath?: string;
} & Partial<Record<ValidTransforms, boolean>> &
	BaseOptions;

export type ResolvedOptions = Required<Options>;
export type TransformOptions = Pick<ResolvedOptions, ValidTransforms>;

export type Transformer = (
	printer: Printer,
	s: MagicString,
	id: string,
) => void;
export type Transformers = [ValidTransforms, Transformer][];
