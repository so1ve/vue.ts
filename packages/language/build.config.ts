import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
	clean: true,
	declaration: true,
	externals: ["@vue/language-core", "@volar/typescript", "typescript"],
});
