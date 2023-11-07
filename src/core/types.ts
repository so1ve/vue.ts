export interface Options {
	tsconfigPath?: string;
	defineEmits?: boolean;
	defineProps?: boolean;
}

export type ResolvedOptions = Required<Options>;
