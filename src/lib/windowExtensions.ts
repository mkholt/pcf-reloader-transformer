import ts from "typescript"
import { paramsVariableName } from "./constructor"
import { declareVar } from "./helpers"
import { paramsTypeName } from "./paramsType"

export const windowInterfaceName = ts.factory.createIdentifier("PcfWindow")
export const windowVariableName = ts.factory.createIdentifier("window")

export function createAndDeclareWindowInterface() {
	const windowInterface = ts.factory.createInterfaceDeclaration(undefined, undefined, windowInterfaceName, undefined, [
		ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
			ts.factory.createExpressionWithTypeArguments(ts.factory.createIdentifier("Window"), undefined)
		])
	], [
		ts.factory.createPropertySignature(undefined, paramsVariableName, undefined, ts.factory.createTypeReferenceNode(paramsTypeName))
	]);

	const decl = declareVar(windowVariableName, false, ts.factory.createTypeReferenceNode(windowInterfaceName), undefined, true)

	return [windowInterface, decl]
}