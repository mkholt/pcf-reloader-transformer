import {
	factory,
	forEachChild,
	isImportDeclaration,
	SourceFile,
} from 'typescript';

import * as inject from '../injected';
import {
	access,
	id,
	printNode,
	toString,
} from '../lib';

export type MethodName = keyof typeof inject

const injectLibName = id("_pcfReloadLib")

/**
 * Build a namespace inmport for the injected code
 * 
 * ```
 * import * as _pcfReloadLib from "pcf-reloader-transformer/dist/injected"
 * ```
 * @returns The import declaration for the injected code
 */
export const createLibraryImport = () =>
	factory.createImportDeclaration(
		undefined,
		undefined,
		factory.createImportClause(
			false,
			undefined,
			factory.createNamespaceImport(injectLibName)
		),
		toString("pcf-reloader-transformer/dist/injected")
	)

let _importSource: string|undefined
const libraryImportSource = (sourceFile: SourceFile) => _importSource ?? (_importSource = printNode(createLibraryImport(), sourceFile))

/**
 * Check if the injected code library has already been imported in the given source file
 * 
 * This is used to check if we've already updated the given source file
 * @param sourceFile The source file to check
 * @returns TRUE if the code has already been imported
 */
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

/**
 * Build access call to the given method in the injected code.
 * @param method The name of the method to call in the injected code
 * @returns An access call to the given method
 */
export const accessLib = (method: MethodName) =>
	access(injectLibName, id(method))
