import {
	Expression,
	factory,
} from "typescript";

import * as inject from "../injected";
import {
	access,
	call,
	declareConst,
	id,
} from "../lib";

export type ParamName = keyof inject.ReloadParams
export type MethodName = keyof typeof inject

const injectLibName = id("_pcfReloadLib")

export const createLibraryImport = () =>
	declareConst(injectLibName,
		call(id("require"),
			factory.createStringLiteral("pcf-reloader-transformer")))

export const callLib = (method: MethodName, ...args: Expression[]) =>
	call(access(injectLibName, id(method)), ...args)
