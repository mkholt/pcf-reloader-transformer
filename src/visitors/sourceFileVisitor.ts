import ts, {
	factory,
	isClassDeclaration,
	Node,
	SourceFile,
	SyntaxKind,
	TransformationContext,
} from "typescript";

import { createLibraryImport } from "../builders";
import { buildClass } from "../builders/injectorClass";
import { log } from "../injected/logger";
import { id } from "../lib";
import { IPluginConfig } from "../pluginConfig";

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

export const visitor = (sourceFile: SourceFile, opts: IPluginConfig, ctx: TransformationContext) =>
	(node: Node): Node[] | Node => {
		if (!isValidNode(node)) {
			return node
		}

		const className = node.name

		if (opts.verbose) {
			const fileName = sourceFile.fileName
			const pos = sourceFile.getLineAndCharacterOfPosition(node.getStart());
			log(`Found class: ${className.getText()} in ${fileName}:${pos.line + 1}`)
		}

		// We are in the main class, implementing ComponentFramework.StandardControl<IInputs, IOutputs>

		// Build the library import
		const importDecl = createLibraryImport()

		// Assign currentScript variable
		//const scriptAssignment = createCurrentScriptAssignment()

		// Check if the class has a constructor to hook into
		//const foundConstructor = forEachChild(node, constructorVisitor)

		// No constructor found, inject it
		/*const constructor = (!foundConstructor)
			? createConstructorDeclaration()
			: undefined*/

		// We want the class declaration as well, with modified methods
		//const classDeclaration = visitEachChild(node, classVisitor(opts), ctx)

		// Update the detected class with the new statements
		/*const classMembers = [
			...classDeclaration.members,
			...(constructor ? [constructor] : []),
			//refreshMethod
		]*/

		// Rename the class by postfixing _reloaded
		const newName = id(node.name.getText(sourceFile) + "_reloaded")

		// Remove the export modifier from the class, we only want to export ourselves
		const modifiers = node.modifiers?.filter(m => m.kind !== SyntaxKind.ExportKeyword)

		// Build the class from the updated members
		const newClass = factory.updateClassDeclaration(
			node,
			node.decorators,
			modifiers,
			newName,
			node.typeParameters,
			node.heritageClauses,
			node.members
		)

		// Build the injected class
		const reloaderClass = buildClass(id(node.name.getText(sourceFile)), sourceFile.languageVersion, ctx)

		// Generate constructor for after class declaration
		//const constructorDeclaration = createConstructorCall(className)

		// Return the updated source
		return [
			importDecl,
			//scriptAssignment,
			newClass,
			reloaderClass
			//constructorDeclaration
		]
	}