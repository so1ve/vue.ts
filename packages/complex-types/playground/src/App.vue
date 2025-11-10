<script setup lang="ts">
import HelloWorld from "./components/HelloWorld.vue";
</script>

<template>
	<div>
		<a href="https://vuejs.org/" target="_blank">
			<img alt="Vue logo" class="logo vue" src="./assets/vue.svg" />
		</a>
	</div>
	<HelloWorld msg="Vite + Vue" />
	<HelloWorld msg="Vite + Vue" />
	<HelloWorld msg="Vite + Vue" />
	<HelloWorld msg="Vite + Vue" />
	<HelloWorld msg="Vite + Vue" />
	<HelloWorld msg="Vite + Vue" />
	<HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
	height: 6em;
	padding: 1.5em;
	will-change: filter;
	transition: filter 300ms;
}
.logo.vue:hover {
	filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
