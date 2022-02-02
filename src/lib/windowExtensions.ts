import ts from "typescript";

import {
	declareVar,
	paramsTypeName,
	paramsVariableName,
} from "@/lib";

export const windowInterfaceName = ts.factory.createIdentifier("PcfWindow")
export const windowVariableName = ts.factory.createIdentifier("window")

/**
 * Create the declaration for extending window with the params type
 * 
 * ```
 * interface PcfWindow extends Window {
 *     pcfReloadParams: PcfReloadParams;
 * }
 * declare let window: PcfWindow;
 * ```
 * 
 * @returns The updated window interface
 */
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