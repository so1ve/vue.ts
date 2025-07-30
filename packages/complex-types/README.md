# @vue.ts/complex-types

[![NPM version](https://img.shields.io/npm/v/@vue.ts/complex-types?color=a1b858&label=)](https://www.npmjs.com/package/@vue.ts/complex-types)

Use [`@vue/language-core`](https://github.com/vuejs/language-tools/tree/master/packages/language-core) to support complex types for Vue's Macros.

For example: fixes https://github.com/vuejs/core/issues/8286.

## 📦 Installation

```bash
$ npm install -D @vue.ts/complex-types
$ yarn add -D @vue.ts/complex-types
$ pnpm add -D @vue.ts/complex-types
```

## 🚀 Usage

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import VueComplexTypes from "@vue.ts/complex-types/vite";

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
<summary>Rolldown</summary><br>

```ts
// rolldown.config.js
import VueComplexTypes from "@vue.ts/complex-types/rolldown";

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
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import VueComplexTypes from "@vue.ts/complex-types/rollup";

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
		require("@vue.ts/complex-types/webpack")({
			/* options */
		}),
	],
};
```

<br></details>

<details>
<summary>Rspack</summary><br>

```ts
// rspack.config.js
module.exports = {
	/* ... */
	plugins: [
		require("@vue.ts/complex-types/rspack")({
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
	modules: ["@vue.ts/complex-types/nuxt"],
	complexTypes: {
		/* options */
	},
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
			require("@vue.ts/complex-types/webpack")({
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
			"@vue.ts/complex-types/vite",
			{
				/* options */
			},
		],
	],
};
```

```ts
// quasar.conf.js [Webpack]
const VueComplexTypesPlugin = require("@vue.ts/complex-types/webpack");

module.exports = {
	build: {
		chainWebpack(chain) {
			chain.plugin("@vue.ts/complex-types").use(
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
		require("@vue.ts/complex-types/esbuild")({
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
import VueComplexTypes from "@vue.ts/complex-types/astro";

export default defineConfig({
	integrations: [
		VueComplexTypes({
			/* options */
		}),
	],
});
```

<br></details>

## 📚 Options

### `tsconfigPath`

Path to your `tsconfig.json`.

- Type: `string`
- Default: `path.join(process.cwd(), "tsconfig.json")`

### `defineEmits`

Transform `defineEmits` or not.

- Type: `boolean`
- Default: `true`

### `defineProps`

Transform `defineProps` or not.

- Type: `boolean`
- Default: `true`

## 📝 License

[MIT](./LICENSE). Made with ❤️ by [Ray](https://github.com/so1ve)
