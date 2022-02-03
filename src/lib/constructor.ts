import ts, { Identifier } from "typescript";

import { declareConst } from "./";
import {
	access,
	id,
} from "./helpers"; // For some reason importing this from ./ doesn't work
import { paramNames } from "./paramsType";
import { windowVariableName } from "./windowExtensions";

export const paramsVariableName = id("pcfReloadParams")
export const paramsReference = access(windowVariableName, paramsVariableName)
export const accessParam = (prop: Identifier) => access(windowVariableName, paramsVariableName, prop)

/**
 * Create a call to instantiate the PCF class
 * 
 * ```
 * if (window.pcfReloadParams)
 *     new SampleComponent();
 * ```
 * 
 * @param className The name of the PCF class
 * @returns The call to the new PCF class
 */
export function createConstructorCall(className: ts.Identifier) {
	const constructorStatement = ts.factory.createIfStatement(
		paramsReference,
		ts.factory.createExpressionStatement(ts.factory.createNewExpression(
			className,
			undefined,
			[]
		)),
		undefined
	)

	return constructorStatement
}

/**
 * Generate the body block (not the method) of the constructor
 * 
 * ```
 * if (window.pcfReloadParams) {
 *     const params = window.pcfReloadParams;
 *     this.init(params.context, params.notifyOutputChanged, params.state, params.container);
 *     this.updateView(params.context);
 * }
 * ...existing code...
 * ```
 * 
 * @param ctor The constructor declaration, if found
 * @returns The body of the updated class constructor
 */
export function createConstructorBody(ctor?: ts.ConstructorDeclaration) {
	const paramsName = id("params")
	const paramsConst = declareConst(paramsName, paramsReference)

	const initCall = ts.factory.createExpressionStatement(ts.factory.createCallExpression(
		access(ts.factory.createThis(), id("init")),
		undefined,
		[
			access(paramsName, id(paramNames.context)),
			access(paramsName, id(paramNames.noc)),
			access(paramsName, id(paramNames.state)),
			access(paramsName, id(paramNames.container))
		]
	))

	const updateViewCall = ts.factory.createExpressionStatement(ts.factory.createCallExpression(
		access(ts.factory.createThis(), id("updateView")),
		undefined,
		[access(paramsName, id(paramNames.context))]
	))

	const thenBlock = ts.factory.createBlock([
		paramsConst,
		initCall,
		updateViewCall
	], true)

	const ifStatement = ts.factory.createIfStatement(
		paramsReference,
		thenBlock
	)

	const existingBody = ctor?.body?.statements ?? ts.factory.createNodeArray([])

	const block = ts.factory.createBlock([
		ifStatement,
		...existingBody
	], true)

	return block
}

/**
 * Declare the constructor method, using the body from `createConstructorBody`
 * 
 * ```
 * constructor() {
 *     ...constructor body...
 * }
 * ```
 * 
 * @see createConstructorBody
 * @returns The constructor declaration
 */
export const createConstructorDeclaration = () =>
	ts.factory.createConstructorDeclaration(
		undefined, undefined, [],
		createConstructorBody()
	)