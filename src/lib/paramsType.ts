import ts = require("typescript")

export const paramsTypeName = ts.factory.createIdentifier("PcfReloadParams")
export const paramsVariableName = ts.factory.createIdentifier("pcfReloadParams")

export const paramNames = {
	context: "context",
	noc: "notifyOutputChanged",
	state: "state",
	container: "container"
}

export function createParamsType() {
	const paramsTypeLiteral = ts.factory.createTypeLiteralNode([
		ts.factory.createPropertySignature(undefined, paramNames.context, undefined, ts.factory.createTypeReferenceNode("ComponentFramework.Context<IInputs>", undefined)),
		ts.factory.createPropertySignature(undefined, paramNames.noc, undefined, ts.factory.createTypeReferenceNode("() => void", undefined)),
		ts.factory.createPropertySignature(undefined, paramNames.state, undefined, ts.factory.createTypeReferenceNode("ComponentFramework.Dictionary", undefined)),
		ts.factory.createPropertySignature(undefined, paramNames.container, undefined, ts.factory.createTypeReferenceNode("HTMLDivElement", undefined))
	]);
	const paramsTypeNode = ts.factory.createTypeAliasDeclaration(undefined, undefined, paramsTypeName, undefined, paramsTypeLiteral);
	return paramsTypeNode;
}