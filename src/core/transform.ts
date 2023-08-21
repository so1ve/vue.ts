import MagicString from "magic-string";
import type { TransformResult } from "unplugin";
import { parse } from "vue/compiler-sfc";

import {
	findDefinePropsCall,
	getProgramAndSourceFile,
	normalizePath,
	printVueAcceptableTypeLiteralFromSymbols,
	vueFilepathToVirtualFilepath,
} from "./utils";

function transformSetupCode(
	code: string,
	s: MagicString,
	id: string,
	offset: number,
) {
	const { program, sourceFile } = getProgramAndSourceFile(
		code,
		vueFilepathToVirtualFilepath(id),
	);
	const typeChecker = program.getTypeChecker();
	const definePropsCall = findDefinePropsCall(sourceFile);
	if (!definePropsCall) {
		return;
	}
	const typeArgument = definePropsCall.typeArguments![0];
	const type = typeChecker.getTypeAtLocation(typeArgument);
	const vueAcceptableTypeString = printVueAcceptableTypeLiteralFromSymbols(
		type.getProperties(),
		typeChecker,
	);
	s.overwrite(
		offset + typeArgument.getStart(sourceFile),
		offset + typeArgument.getEnd(),
		vueAcceptableTypeString,
	);
}

export function transform(code: string, id: string): TransformResult {
	const s = new MagicString(code);
	const parsed = parse(code);
	if (
		!parsed.descriptor.scriptSetup ||
		parsed.descriptor.scriptSetup.lang !== "ts"
	) {
		return;
	}

	const start = parsed.descriptor.scriptSetup.loc.start.offset;
	const end = parsed.descriptor.scriptSetup.loc.end.offset;
	const scriptSetupCode = code.slice(start, end);
	transformSetupCode(scriptSetupCode, s, normalizePath(id), start);

	return {
		code: s.toString(),
		map: s.generateMap({ hires: true }),
	};
}
