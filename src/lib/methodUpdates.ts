import {
	factory,
	Identifier,
	isIdentifier,
	MethodDeclaration,
	NodeArray,
	ParameterDeclaration,
	Statement,
} from "typescript";

import {
	access,
	accessParam,
	id,
	listenCallName,
	paramNames,
	paramsReference,
	setVariable,
} from "./";

/**
 * Handles one of `init` and `updateView` methods, generating the following:
 * 
 * Init:
 * ```
 * this.listenToWSUpdates({
 *     context: context,
 *     notifyOutputChanged: notifyOutputChanged,
 *     state: state,
 *     container: container
 * });
 * ...existing code...
 * ```
 * 
 * UpdateView:
 * ```
 * if (window.pcfReloadParams)
 *     window.pcfReloadParams.context = context;
 * ...existing code...
 * ```
 * 
 * @param node The method declaration to update
 * @returns The updated method body
 */
export function handleMethod(node: MethodDeclaration) {
	const existingBody = node.body?.statements ?? factory.createNodeArray()

	switch (node.name.getText()) {
	case 'init':
		return createInitBody(existingBody, node.parameters)
	case 'updateView':
		return createUpdateViewBody(existingBody, node.parameters)
	}

	return undefined
}

const getNamesFromParameters = (params: NodeArray<ParameterDeclaration>) =>
	params.filter((p): p is ParameterDeclaration & { name: Identifier}  => isIdentifier(p.name)).map(p => p.name)

function createInitBody(existingBody: NodeArray<Statement>, params: NodeArray<ParameterDeclaration>) {
	const names = getNamesFromParameters(params)
	if (names.length != 4) return

	const listenCall = factory.createExpressionStatement(
		factory.createCallExpression(
			access(factory.createThis(), listenCallName),
			undefined,
			[
				factory.createObjectLiteralExpression([
					factory.createPropertyAssignment(paramNames.context, names[0]),
					factory.createPropertyAssignment(paramNames.noc, names[1]),
					factory.createPropertyAssignment(paramNames.state, names[2]),
					factory.createPropertyAssignment(paramNames.container, names[3])
				], true)
			]
		)
	)

	const block = factory.createBlock([
		listenCall,
		...existingBody
	], true)

	return block
}

function createUpdateViewBody(existingBody: NodeArray<Statement>, params: NodeArray<ParameterDeclaration>) {
	const names = getNamesFromParameters(params)
	if (names.length != 1) return

	const context = id(paramNames.context)
	const ifStatement = factory.createIfStatement(
		paramsReference,
		setVariable(accessParam(context), names[0])
	)

	const block = factory.createBlock([
		ifStatement,
		...existingBody
	], true)

	return block
}