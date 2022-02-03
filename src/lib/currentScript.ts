import {
	access,
	declareConst,
} from "./";
import { id } from "./helpers";

export const currentScript = id("_pcfReloadCurrentScript")

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
		currentScript,
		access(
			id("document"),
			id("currentScript")
		)
	)

	return currentScriptAssignment
}
