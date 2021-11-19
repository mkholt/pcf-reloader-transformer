import ts from "typescript"
import { paramsVariableName } from "./constructor"
import { paramsTypeName } from "./paramsType"

export const windowInterfaceName = ts.factory.createIdentifier("PcfWindow")
export const windowVariableName = ts.factory.createIdentifier("window")

function createWindowDeclaration() {
	const decl = ts.factory.createVariableStatement(
		[ts.factory.createModifier(ts.SyntaxKind.DeclareKeyword)],
		ts.factory.createVariableDeclarationList([
			ts.factory.createVariableDeclaration(windowVariableName, undefined, ts.factory.createTypeReferenceNode(windowInterfaceName))
		], ts.NodeFlags.Let | ts.NodeFlags.ContextFlags))

	return decl
}

export function createAndDeclareWindowInterface() {
	const windowInterface = ts.factory.createInterfaceDeclaration(undefined, undefined, windowInterfaceName, undefined, [
		ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
			ts.factory.createExpressionWithTypeArguments(ts.factory.createIdentifier("Window"), undefined)
		])
	], [
		ts.factory.createPropertySignature(undefined, paramsVariableName, undefined, ts.factory.createTypeReferenceNode(paramsTypeName))
	]);

	return [windowInterface, createWindowDeclaration()]
}