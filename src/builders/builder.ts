import { factory } from 'typescript';

import {
	accessLib,
	call,
	fatArrow,
	id,
	stmt,
	toString,
	writeLog,
} from '../lib';
import { IPluginConfig } from '../pluginConfig';

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
	const construct = factory.createNewExpression(id(wrappedName), undefined, undefined)

	const body = factory.createBlock([
		stmt(writeLog(`Builder called for:`, wrappedName)),
		...(opts.debug ? [factory.createDebuggerStatement()] : []),
		factory.createReturnStatement(construct)
	])

	const lambda = factory.createArrowFunction(undefined, undefined, [], undefined,
		fatArrow,
		body)

	const classNameString = toString(className)

	return call(accessLib("UpdateBuilder"), classNameString, lambda)
}
