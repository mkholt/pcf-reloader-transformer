import ts, {
	factory,
	isClassDeclaration,
	Node,
	SourceFile,
	SyntaxKind,
} from 'typescript';

import {
	createCurrentScriptAssignment,
	createLibraryImport,
} from '../builders';
import { buildBuilderUpdate } from '../builders/builder';
import { buildClass } from '../builders/injectorClass';
import { log } from '../injected/logger';
import { id } from '../lib';
import { IPluginConfig } from '../pluginConfig';

type hasName = {
	name: Exclude<ts.ClassDeclaration['name'], undefined>
}
const isValidNode = (node: Node): node is ts.ClassDeclaration & hasName => {
	// Check: Not a class, skip it
	if (!isClassDeclaration(node)) return false

	// Check: Implements ComponentFramework.StandardControl
	const implement = node.heritageClauses?.filter(h => h.token == SyntaxKind.ImplementsKeyword
		&& h.types.find(t => t.getText() === "ComponentFramework.StandardControl<IInputs, IOutputs>"))

	if (!implement?.length) return false

	// Check: Has class name so we can construct meaninfully
	const className = node.name
	if (!className) return false

	return true
}

export const visitor = (sourceFile: SourceFile, opts: IPluginConfig) =>
	(node: Node): Node[] | Node => {
		if (!isValidNode(node)) {
			return node
		}

		const className = node.name.getText()

		if (opts.verbose) {
			const fileName = sourceFile.fileName
			const pos = sourceFile.getLineAndCharacterOfPosition(node.getStart());
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
		const modifiers = node.modifiers?.filter(m => m.kind !== SyntaxKind.ExportKeyword)

		// Build the class from the updated members
		const newClass = factory.updateClassDeclaration(
			node,
			node.decorators,
			modifiers,
			id(wrappedName),
			node.typeParameters,
			node.heritageClauses,
			node.members
		)

		// Build the injected class
		const reloaderClass = buildClass(className, wrappedName, opts)

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