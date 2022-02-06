import {
	ConstructorDeclaration,
	factory,
	Identifier,
} from "typescript";

import { stmt } from "../lib";
import {
	callLib,
	currentScriptName,
} from "./";

/**
 * Create a call to instantiate the PCF class
 * 
 * ```
 * if (_pcfReloadLib.hasParams())
 *     new SampleComponent();
 * ```
 * 
 * @param className The name of the PCF class
 * @returns The call to the new PCF class
 */
export function createConstructorCall(className: Identifier) {
	
	const constructorStatement = factory.createIfStatement(
		callLib("hasParams"),
		stmt(factory.createNewExpression(
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
 * _pcfReloader.constructor(this, _pcfReloadCurrentScript)
 * ...existing code...
 * ```
 * 
 * @param ctor The constructor declaration, if found
 * @returns The body of the updated class constructor
 */
export function createConstructorBody(ctor?: ConstructorDeclaration) {
	const callConstruct = callLib("onConstruct", factory.createThis(), currentScriptName)
	const existingBody = ctor?.body?.statements ?? factory.createNodeArray([])

	const block = factory.createBlock([
		stmt(callConstruct),
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
	factory.createConstructorDeclaration(
		undefined, undefined, [],
		createConstructorBody()
	)