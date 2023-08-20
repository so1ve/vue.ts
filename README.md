# unplugin-vue-complex-types

[![NPM version](https://img.shields.io/npm/v/unplugin-vue-complex-types?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-vue-complex-types)

## 📦 Installation

```bash
$ npm install -D unplugin-vue-complex-types
$ yarn add -D unplugin-vue-complex-types
$ pnpm add -D unplugin-vue-complex-types
```

## 🚀 Usage

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import VueComplexTypes from "unplugin-vue-complex-types/vite";

export default defineConfig({
	plugins: [
		VueComplexTypes({
			/* options */
		}),
	],
});
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import VueComplexTypes from "unplugin-vue-complex-types/rollup";

export default {
	plugins: [
		VueComplexTypes({
			/* options */
		}),
		// other plugins
	],
};
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
	/* ... */
	plugins: [
		require("unplugin-vue-complex-types/webpack")({
			/* options */
		}),
	],
};
```

<br></details>

<details>
<summary>Nuxt</summary><br>

```ts
// nuxt.config.ts
export default defineNuxtConfig({
	modules: ["unplugin-vue-complex-types/nuxt"],
});
```

<br></details>

<details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
	configureWebpack: {
		plugins: [
			require("unplugin-vue-complex-types/webpack")({
				/* options */
			}),
		],
	},
};
```

<br></details>

<details>
<summary>Quasar</summary><br>

```ts
// quasar.conf.js [Vite]
module.exports = {
	vitePlugins: [
		[
			"unplugin-vue-complex-types/vite",
			{
				/* options */
			},
		],
	],
};
```

```ts
// quasar.conf.js [Webpack]
const VueComplexTypesPlugin = require("unplugin-vue-complex-types/webpack");

module.exports = {
	build: {
		chainWebpack(chain) {
			chain.plugin("unplugin-vue-complex-types").use(
				VueComplexTypesPlugin({
					/* options */
				}),
			);
		},
	},
};
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from "esbuild";

build({
	/* ... */
	plugins: [
		require("unplugin-vue-complex-types/esbuild")({
			/* options */
		}),
	],
});
```

<br></details>

<details>
<summary>Astro</summary><br>

```ts
// astro.config.mjs
import VueComplexTypes from "unplugin-vue-complex-types/astro";

export default defineConfig({
	integrations: [
		VueComplexTypes({
			/* options */
		}),
	],
});
```

<br></details>

## 📝 License

[MIT](./LICENSE). Made with ❤️ by [Ray](https://github.com/so1ve)
