import { factory } from "typescript";

import {
	access,
	declareConst,
} from "@/lib";

export const currentScript = factory.createIdentifier("currentScript")

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
			factory.createIdentifier("document"),
			factory.createIdentifier("currentScript")
		)
	)

	return currentScriptAssignment
}
