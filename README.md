# pkg-name

[![NPM version](https://img.shields.io/npm/v/pkg-name?color=a1b858&label=)](https://www.npmjs.com/package/pkg-name)

## 📦 Installation

```bash
$ npm install -D pkg-name
$ yarn add -D pkg-name
$ pnpm add -D pkg-name
```

## 🚀 Usage

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import PkgName from "pkg-name/vite";

export default defineConfig({
	plugins: [
		PkgName({
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
import PkgName from "pkg-name/rollup";

export default {
	plugins: [
		PkgName({
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
		require("pkg-name/webpack")({
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
	modules: ["pkg-name/nuxt"],
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
			require("pkg-name/webpack")({
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
			"pkg-name/vite",
			{
				/* options */
			},
		],
	],
};
```

```ts
// quasar.conf.js [Webpack]
const PkgNamePlugin = require("pkg-name/webpack");

module.exports = {
	build: {
		chainWebpack(chain) {
			chain.plugin("pkg-name").use(
				PkgNamePlugin({
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
		require("pkg-name/esbuild")({
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
import PkgName from "pkg-name/astro";

export default defineConfig({
	integrations: [
		PkgName({
			/* options */
		}),
	],
});
```

<br></details>

## 📝 License

[MIT](./LICENSE). Made with ❤️ by [Ray](https://github.com/so1ve)
