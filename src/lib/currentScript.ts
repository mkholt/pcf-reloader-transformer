import ts = require("typescript")
import { declareConst } from "./helpers"

export const currentScript = ts.factory.createIdentifier("currentScript")

export function createCurrentScriptAssignment() {
	const currentScriptAssignment = declareConst(
		currentScript,
		ts.factory.createPropertyAccessExpression(
			ts.factory.createIdentifier("document"),
			ts.factory.createIdentifier("currentScript")
		)
	)

	return currentScriptAssignment
}
