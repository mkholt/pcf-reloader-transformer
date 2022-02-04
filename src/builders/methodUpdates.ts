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
	declareConst,
	id,
	stmt,
} from "../lib";
import { IPluginConfig } from "../pluginConfig";
import {
	callLib,
	ParamName,
} from "./";

/**
 * Handles one of `init` and `updateView` methods, generating the following:
 * 
 * Init:
 * ```
 * const _pcfReloaderParams = {
 *     context: context,
 *     notifyOutputChanged: notifyOutputChanged,
 *     state: state,
 *     container: container
 * };
 * _pcfReloader.connect(this, "http://localhost:8181", params);
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
export function handleMethod(node: MethodDeclaration, opts: IPluginConfig) {
	const existingBody = node.body?.statements ?? factory.createNodeArray()

	switch (node.name.getText()) {
	case 'init':
		return createInitBody(existingBody, node.parameters, opts)
	case 'updateView':
		return createUpdateViewBody(existingBody, node.parameters)
	}

	return undefined
}

const getNamesFromParameters = (params: NodeArray<ParameterDeclaration>) =>
	params.filter((p): p is ParameterDeclaration & { name: Identifier}  => isIdentifier(p.name)).map(p => p.name)

/**
 * Builds the init method body
 * ```
 * const _pcfReloaderParams = {
 *     context: context,
 *     notifyOutputChanged: notifyOutputChanged,
 *     state: state,
 *     container: container
 * };
 * _pcfReloader.connect(this, "http://localhost:8181", params);
 * ...existing code...
 * ```
 * 
 * @param existingBody The existing body block
 * @param params The parameters passed to the init method
 * @returns The new body block
 */
function createInitBody(existingBody: NodeArray<Statement>, params: NodeArray<ParameterDeclaration>, opts: IPluginConfig) {
	const names = getNamesFromParameters(params)
	if (names.length < 4) return

	const assign = (argName: ParamName, ident: Identifier) =>
		factory.createPropertyAssignment(argName, ident)

	const paramObj = factory.createObjectLiteralExpression([
		assign("context", names[0]),
		assign("notifyOutputChanged", names[1]),
		assign("state", names[2]),
		assign("container", names[3])
	], true)

	const paramsName = id("_pcfReloaderParams")

	const defaultAddress = opts.useBrowserSync ?? true
		? "http://localhost:8181"
		: "ws://127.0.0.1:8181/ws"

	const declareObj = declareConst(paramsName, paramObj)
	const callInit = callLib("connect",
		factory.createThis(),
		factory.createStringLiteral(opts.wsAddress ?? defaultAddress),
		paramsName)

	const block = factory.createBlock([
		declareObj,
		stmt(callInit),
		...existingBody
	], true)

	return block
}

/**
 * Build the updateView method body
 * ```
 * _pcfReloader.updateContext(context)
 * ...existing code...
 * ```
 */
function createUpdateViewBody(existingBody: NodeArray<Statement>, params: NodeArray<ParameterDeclaration>) {
	const names = getNamesFromParameters(params)
	if (names.length < 1) return

	const block = factory.createBlock([
		stmt(callLib("updateContext", names[0])),
		...existingBody
	], true)

	return block
}
