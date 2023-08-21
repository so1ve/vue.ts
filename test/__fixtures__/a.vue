<script setup lang="ts">
import type { A } from "./foo";

defineProps<
	{
		msg: string;
	} & A
>();
</script>
