import {
	Expression,
	factory,
	forEachChild,
	isImportDeclaration,
	SourceFile,
} from "typescript";

import * as inject from "../injected";
import {
	access,
	call,
	id,
	printNode,
} from "../lib";

export type ParamName = keyof inject.ReloadParams
export type MethodName = keyof typeof inject

const injectLibName = id("_pcfReloadLib")

export const createLibraryImport = () =>
	factory.createImportDeclaration(
		undefined,
		undefined,
		factory.createImportClause(
			false,
			undefined,
			factory.createNamespaceImport(injectLibName)
		),
		factory.createStringLiteral("pcf-reloader-transformer/dist/injected")
	)

let _importSource: string|undefined
const libraryImportSource = (sourceFile: SourceFile) => _importSource ?? (_importSource = printNode(createLibraryImport(), sourceFile))

export const hasLibraryImport = (sourceFile: SourceFile) => {
	const existingImportDecl = forEachChild(sourceFile, (n) => {
		if (!isImportDeclaration(n)) return undefined
		const importText = printNode(n, sourceFile)
		return importText === libraryImportSource(sourceFile)
			? n
			: undefined
	})

	return !!existingImportDecl
}

export const callLib = (method: MethodName, ...args: Expression[]) =>
	call(access(injectLibName, id(method)), ...args)
