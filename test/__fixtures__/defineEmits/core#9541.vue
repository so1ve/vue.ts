<script setup lang="ts">
interface Base {
	(e: "change", id: number): void;
}
interface Emits extends Base {
	(e: "unChange", id: number): void;
}
const emit = defineEmits<Emits>();

emit("change", 1);
</script>
