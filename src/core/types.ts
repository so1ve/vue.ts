import type MagicString from "magic-string";

import type { Printer } from "./printer";

export interface Options {
	tsconfigPath?: string;
	defineEmits?: boolean;
	defineProps?: boolean;
}

type ValidTransforms = "defineEmits" | "defineProps";

export type ResolvedOptions = Required<Options>;
export type TransformOptions = Pick<ResolvedOptions, ValidTransforms>;

export type Transformer = (
	printer: Printer,
	s: MagicString,
	id: string,
) => void;
export type Transformers = [ValidTransforms, Transformer][];
