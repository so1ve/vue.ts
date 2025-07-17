<script
	setup
	lang="ts"
	generic="T extends string, U extends (string | number)[], I"
>
import type { SomeInterface } from "./basic-ts";

defineProps<
	{
		string: string;
		optionalString?: string;
		stringUnion: "a" | "b";
		genericExtendsString: T;
		array: string[];
		genericArray: U;
		genericCondition: I extends "a" ? "a" : 1;
		function: () => void;
		// keepOrder1: string | number;
		// keepOrder2: number | string;
		error: Error;
		null: string | null;
	} & SomeInterface & {
			[MappedString in "1-1" | "1-2"]: `${MappedString}MappedType`;
		} & {
			[MappedString in "2-1" | "2-2"]?: `${MappedString}OptionalMappedType`;
		}
>();
</script>
