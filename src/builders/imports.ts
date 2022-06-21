import {
	ClassDeclaration,
	factory,
	forEachChild,
	isImportDeclaration,
	isTypeReferenceNode,
	SourceFile,
	SyntaxKind,
} from 'typescript';

import * as Controls from '../injected/controls';
import {
	injectLibName,
	printNode,
	reactControl,
	standardControl,
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

export type ControlType = keyof Pick<typeof Controls, "ReactControl"|"StandardControl">

export type ControlHeritage = {
	controlType: ControlType
	input: string
	output: string
}

export const getParameterNames = (node: ClassDeclaration): ControlHeritage|undefined => {
	// We're only interested in "implements" clauses, not "extends"
	const clause = node.heritageClauses?.find(h => h.token === SyntaxKind.ImplementsKeyword)
	if (!clause) return undefined

	// We want it to implement "ComponentFramework.StandardControl" or "ComponentFramework.ReactControl"
	const actualControlType = clause.types.find(t => [standardControl, reactControl].includes(t.expression.getText()))
	if (!actualControlType) return undefined

	// The control takes 2 parameters
	if (actualControlType.typeArguments?.length != 2) return undefined

	// The parameters must be type references
	const [input, output] = actualControlType.typeArguments
	if (!isTypeReferenceNode(input) || !isTypeReferenceNode(output)) return undefined

	// Map the control type
	const controlTypeName = actualControlType.expression.getText()
	const controlType: ControlType = standardControl === controlTypeName
		? "StandardControl"
		: "ReactControl"

	// Return the names of the type references
	return {
		controlType: controlType,
		input: input.getText(),
		output: output.getText()
	}
}
