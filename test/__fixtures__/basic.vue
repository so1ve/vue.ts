<script setup lang="ts" generic="T extends string">
import type { SomeInterface } from "./basic-ts";

defineProps<
	{
		string: string;
		optionalString?: string;
		stringUnion: "a" | "b";
		genericExtendsString: T;
	} & SomeInterface & {
			[MappedString in "1-1" | "2-1"]: `${MappedString}MappedType`;
		}
>();
</script>
