<script setup lang="ts" generic="T extends string">
import type { Foo } from "./import-from-vue-vue.exclude.vue";

defineProps<Foo>();
</script>
