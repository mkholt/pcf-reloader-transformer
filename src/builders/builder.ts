import { factory } from 'typescript';

import {
	call,
	fatArrow,
	id,
	toString,
} from '../lib';
import { IPluginConfig } from '../pluginConfig';
import { accessLib } from './imports';

/**
 * Build a lambda function to build new wrapped instance and calls SetBuilder with the new instance.
 * 
 * ```
 * UpdateBuilder("pcfName", () => new pcfName_reloaded())
 * ```
 * 
 * @param className The original name of the PCF class
 * @param wrappedName The new (wrapped) named of the PCF class
 * @returns A call to SetBuilder in the injected class, injecting a new lambda function to build the wrapped class instance
 */
export const buildBuilderUpdate = (className: string, wrappedName: string, opts: IPluginConfig) => {
	const body = opts.debug ? factory.createBlock([
		factory.createDebuggerStatement(),
		factory.createReturnStatement(factory.createNewExpression(id(wrappedName), undefined, undefined))
	]) : factory.createNewExpression(id(wrappedName), undefined, undefined)

	const lambda = factory.createArrowFunction(undefined, undefined, [], undefined,
		fatArrow,
		body)

	const classNameString = toString(className)

	return call(accessLib("UpdateBuilder"), classNameString, lambda)
}
