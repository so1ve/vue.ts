<script setup lang="ts">
import type { A } from "./foo";

defineProps<
	{
		msg: string;
		aaa?: string;
		bbb: "a" | "b";
	} & A
>();
</script>
