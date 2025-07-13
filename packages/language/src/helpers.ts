import type * as vue from "@vue/language-core";
import type ts from "typescript/lib/tsserverlibrary";

export function createHelpers(
	language: vue.Language<string>,
	program: ts.Program,
	vueCompilerOptions: vue.VueCompilerOptions,
	ts: typeof import("typescript/lib/tsserverlibrary"),
) {}
