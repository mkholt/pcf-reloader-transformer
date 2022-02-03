import ts, {
	factory,
	forEachChild,
	isClassDeclaration,
	Node,
	SourceFile,
	SyntaxKind,
	TransformationContext,
	visitEachChild,
} from "typescript";

import {
	createAndDeclareWindowInterface,
	createConstructorCall,
	createConstructorDeclaration,
	createCurrentScriptAssignment,
	createListenerMethod,
	createParamsType,
	createRefreshMethod,
	createSyncImport,
} from "../lib";
import { IPluginConfig } from "../pluginConfig";
import {
	classVisitor,
	constructorVisitor,
} from "./";

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
			console.log(`Found class: ${className.getText()} in ${fileName}:${pos.line + 1}`)
		}

		// We are in the main class, implementing ComponentFramework.StandardControl<IInputs, IOutputs>

		// Build the sync import
		const useBrowserSync = opts.useBrowserSync ?? true
		const importDecl = useBrowserSync ? [createSyncImport()] : []

		// Generate constructor for after class declaration
		const constructorDeclaration = createConstructorCall(className)

		// Assign currentScript variable
		const scriptAssignment = createCurrentScriptAssignment()

		// Create type definition for params
		const typeDef = createParamsType()

		// Extend window global with params
		const windowDeclaration = createAndDeclareWindowInterface()

		// Create sync listener
		const listenMethod = createListenerMethod(opts.wsAddress, useBrowserSync)

		// Create the PCF on-message reload method
		const refreshMethod = createRefreshMethod()

		// Check if the class has a constructor to hook into
		const foundConstructor = forEachChild(node, constructorVisitor)

		// No constructor found, inject it
		const constructor = (!foundConstructor)
			? createConstructorDeclaration()
			: undefined

		// We want the class declaration as well, with modified methods
		const classDeclaration = visitEachChild(node, classVisitor, ctx)

		// Update the detected class with the new statements
		const classMembers = [
			...classDeclaration.members,
			...(constructor ? [constructor] : []),
			listenMethod,
			refreshMethod
		]

		const newClass = factory.updateClassDeclaration(
			classDeclaration,
			classDeclaration.decorators,
			classDeclaration.modifiers,
			classDeclaration.name,
			classDeclaration.typeParameters,
			classDeclaration.heritageClauses,
			classMembers
		)

		// Return the updated source
		return [
			...importDecl,
			typeDef,
			...windowDeclaration,
			scriptAssignment,
			newClass,
			constructorDeclaration
		]
	}