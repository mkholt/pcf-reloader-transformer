import {
	factory,
	forEachChild,
	isImportDeclaration,
	SourceFile,
} from 'typescript';

import {
	injectLibName,
	printNode,
	toString,
} from '../lib';

const injectLibSource = "pcf-reloader-transformer/dist/injected"

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
		toString(injectLibSource)
	)

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
		return importText.indexOf(injectLibSource) > -1
			? n
			: undefined
	})

	return !!existingImportDecl
}

