# unplugin-vue-tsx-auto-props

[![NPM version](https://img.shields.io/npm/v/unplugin-vue-tsx-auto-props?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-vue-tsx-auto-props)

## Why?

Vue does not provide a way to automatically specify props for functional components written in TSX. This plugin solves this problem.

Before:

```tsx
import { defineComponent } from "vue";

interface Props {
	foo: string;
}

const Foo = defineComponent((props: Props) => () => <div>{props.foo}</div>);
Foo.props = ["foo"]; // 👈 You need to manually specify the props :(
```

After:

```tsx
import { defineComponent } from "vue";

interface Props {
	foo: string;
}

const Foo = defineComponent((props: Props) => () => <div>{props.foo}</div>);
Object.defineProperty(Foo, "props", {
	value: ["foo"],
}); // 👈 This plugin will do it for you!
```

## 📦 Installation

```bash
$ npm install -D unplugin-vue-tsx-auto-props
$ yarn add -D unplugin-vue-tsx-auto-props
$ pnpm add -D unplugin-vue-tsx-auto-props
```

## 🚀 Usage

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import VueTsxAutoProps from "unplugin-vue-tsx-auto-props/vite";

export default defineConfig({
	plugins: [
		VueTsxAutoProps({
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
import VueTsxAutoProps from "unplugin-vue-tsx-auto-props/rollup";

export default {
	plugins: [
		VueTsxAutoProps({
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
		require("unplugin-vue-tsx-auto-props/webpack")({
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
	modules: ["unplugin-vue-tsx-auto-props/nuxt"],
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
			require("unplugin-vue-tsx-auto-props/webpack")({
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
			"unplugin-vue-tsx-auto-props/vite",
			{
				/* options */
			},
		],
	],
};
```

```ts
// quasar.conf.js [Webpack]
const VueTsxAutoPropsPlugin = require("unplugin-vue-tsx-auto-props/webpack");

module.exports = {
	build: {
		chainWebpack(chain) {
			chain.plugin("unplugin-vue-tsx-auto-props").use(
				VueTsxAutoPropsPlugin({
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
		require("unplugin-vue-tsx-auto-props/esbuild")({
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
import VueTsxAutoProps from "unplugin-vue-tsx-auto-props/astro";

export default defineConfig({
	integrations: [
		VueTsxAutoProps({
			/* options */
		}),
	],
});
```

<br></details>

## 📝 License

[MIT](./LICENSE). Made with ❤️ by [Ray](https://github.com/so1ve)
