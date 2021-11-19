import ts, { Identifier } from "typescript";
import { access, declareConst, id } from "./helpers";
import { paramNames } from "./paramsType";
import { windowVariableName } from "./windowExtensions";

export const paramsVariableName = ts.factory.createIdentifier("pcfReloadParams")
export const paramsReference = access(windowVariableName, paramsVariableName)
export const accessParam = (prop: Identifier) => access(windowVariableName, paramsVariableName, prop)

export function createConstructorCall(className: ts.Identifier) {
	const constructorStatement = ts.factory.createIfStatement(
		paramsReference,
		ts.factory.createExpressionStatement(ts.factory.createNewExpression(
			className,
			undefined,
			[]
		)),
		undefined
	)

	return constructorStatement
}

export const createConstructorDeclaration = () =>
	ts.factory.createConstructorDeclaration(
		undefined, undefined, [],
		createConstructorBody()
	)
	
export function createConstructorBody(ctor?: ts.ConstructorDeclaration) {
	const paramsName = id("params")
	const paramsConst = declareConst(paramsName, paramsReference)

	const initCall = ts.factory.createExpressionStatement(ts.factory.createCallExpression(
		access(ts.factory.createThis(), id("init")),
		undefined,
		[
			access(paramsName, id(paramNames.context)),
			access(paramsName, id(paramNames.noc)),
			access(paramsName, id(paramNames.state)),
			access(paramsName, id(paramNames.container))
		]
	))

	const updateViewCall = ts.factory.createExpressionStatement(ts.factory.createCallExpression(
		access(ts.factory.createThis(), id("updateView")),
		undefined,
		[access(paramsName, id(paramNames.context))]
	))

	const thenBlock = ts.factory.createBlock([
		paramsConst,
		initCall,
		updateViewCall
	], true)

	const ifStatement = ts.factory.createIfStatement(
		paramsReference,
		thenBlock
	)

	const existingBody = ctor?.body?.statements ?? ts.factory.createNodeArray([])

	const block = ts.factory.createBlock([
		ifStatement,
		...existingBody
	], true)

	return block
}