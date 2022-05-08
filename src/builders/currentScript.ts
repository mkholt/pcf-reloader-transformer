import {
	access,
	currentScriptName,
	declareConst,
} from '../lib';
import { id } from '../lib/helpers';

/**
 * Create the constant for getting the reference to the current script tag
 * 
 * ```
 * const currentScript = document.currentScript;
 * ```
 * 
 * @returns The assignment of the currently executing script
 */
export function createCurrentScriptAssignment() {
	const currentScriptAssignment = declareConst(
		currentScriptName,
		access(
			id("document"),
			id("currentScript")
		)
	)

	return currentScriptAssignment
}
