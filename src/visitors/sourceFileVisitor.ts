import {
	ClassDeclaration,
	factory,
	isClassDeclaration,
	Node,
	SourceFile,
	SyntaxKind,
} from 'typescript';

import {
	ControlHeritage,
	createCurrentScriptAssignment,
	createLibraryImport,
	getParameterNames,
} from '../builders';
import { buildBuilderUpdate } from '../builders/builder';
import { buildClass } from '../builders/injectorClass';
import { log } from '../injected/logger';
import { id } from '../lib';
import { IPluginConfig } from '../pluginConfig';

const isValidNode = (node: Node): [ClassDeclaration, string, ControlHeritage]|[] => {
	// Check: Not a class, skip it
	if (!isClassDeclaration(node)) return []

	// Check: Implements ComponentFramework.StandardControl<IInputs, IOutputs>
	const parameterNames = getParameterNames(node)
	if (!parameterNames) return []

	// Check: Has class name so we can construct meaninfully
	const className = node.name?.getText()
	if (!className) return []

	return [node, className, parameterNames]
}

export const visitor = (sourceFile: SourceFile, opts: IPluginConfig) =>
	(node: Node): Node[] | Node => {
		const [classNode, className, parameterNames] = isValidNode(node)
		if (!classNode || !className || !parameterNames) return node

		if (opts.verbose) {
			const fileName = sourceFile.fileName
			const pos = sourceFile.getLineAndCharacterOfPosition(classNode.getStart());
			log(`Found class: ${className} in ${fileName}:${pos.line + 1}`)
		}

		// We are in the main class, implementing ComponentFramework.StandardControl<IInputs, IOutputs>

		// Build the library import
		const importDecl = createLibraryImport()

		// Get the current script element
		const currentScript = createCurrentScriptAssignment()

		// Calculate random hash
		const hash = Math.random().toString(36).slice(-4)

		// Rename the class by postfixing _reloaded_<hash>
		const wrappedName = `${className}_reloaded_${hash}`
		if (opts.verbose) {
			log("Wrapped classname:", wrappedName)
		}

		// Remove the export modifier from the class, we only want to export ourselves
		const modifiers = classNode.modifiers?.filter(m => m.kind !== SyntaxKind.ExportKeyword)

		// Build the class from the updated members
		const newClass = factory.updateClassDeclaration(
			classNode,
			classNode.decorators,
			modifiers,
			id(wrappedName),
			classNode.typeParameters,
			classNode.heritageClauses,
			classNode.members
		)

		// Build the injected class
		const reloaderClass = buildClass(className, parameterNames, opts)

		// Build the code for instantiating
		const updateBuilder = buildBuilderUpdate(className, wrappedName, opts)

		// Return the updated source
		return [
			importDecl,
			currentScript,
			newClass,
			reloaderClass,
			updateBuilder
		]
	}