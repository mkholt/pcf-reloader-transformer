import { factory } from 'typescript';

import {
	call,
	fatArrow,
	id,
	toString,
} from '../lib';
import { accessLib } from './imports';

/**
 * Build a lambda function to build new wrapped instance and calls SetBuilder with the new instance.
 * 
 * ```
 * SetBuilder("pcfName", () => new pcfName_reloaded())
 * ```
 * 
 * @param className The original name of the PCF class
 * @param wrappedName The new (wrapped) named of the PCF class
 * @returns A call to SetBuilder in the injected class, injecting a new lambda function to build the wrapped class instance
 */
export const buildBuilderUpdate = (className: string, wrappedName: string) => {
	const lambda = factory.createArrowFunction(undefined, undefined, [], undefined,
		fatArrow,
		factory.createNewExpression(id(wrappedName), undefined, undefined))

	const classNameString = toString(className)

	return call(accessLib("SetBuilder"), classNameString, lambda)
}
