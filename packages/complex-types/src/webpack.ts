import type { UnpluginFactoryOutput, WebpackPluginInstance } from "unplugin";

import unplugin from "./core";
import type { Options } from "./types";

// Workaround TS2742
export default unplugin.webpack as UnpluginFactoryOutput<
	Options,
	WebpackPluginInstance
>;
