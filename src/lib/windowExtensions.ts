import ts from "typescript";

import {
	declareVar,
	paramsTypeName,
	paramsVariableName,
} from "./";
import { id } from "./helpers";

export const windowInterfaceName = id("PcfWindow")
export const windowVariableName = id("window")

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
			ts.factory.createExpressionWithTypeArguments(id("Window"), undefined)
		])
	], [
		ts.factory.createPropertySignature(undefined, paramsVariableName, undefined, ts.factory.createTypeReferenceNode(paramsTypeName))
	]);

	const decl = declareVar(windowVariableName, false, ts.factory.createTypeReferenceNode(windowInterfaceName), undefined, true)

	return [windowInterface, decl]
}