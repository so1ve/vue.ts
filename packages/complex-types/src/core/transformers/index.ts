import type { TransformOptions, Transformers } from "../types";
import { transformDefineEmits } from "./defineEmits";
import { transformDefineProps } from "./defineProps";

export const transformers = [
	["defineEmits", transformDefineEmits],
	["defineProps", transformDefineProps],
] as Transformers;

export const getTransformers = (options: TransformOptions): Transformers =>
	transformers.filter(([key]) => !!options[key]);
