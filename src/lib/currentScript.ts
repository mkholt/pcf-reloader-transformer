import { factory } from "typescript"
import { access, declareConst } from "./helpers"

export const currentScript = factory.createIdentifier("currentScript")

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
