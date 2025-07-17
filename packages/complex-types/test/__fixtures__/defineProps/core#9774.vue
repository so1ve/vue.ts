<script setup lang="ts">
import type { ExtractPropTypes } from "vue";
const testProps = {
	a: {
		type: String,
	},
};

type TestProps = ExtractPropTypes<typeof testProps>;
defineProps<TestProps>();
</script>
