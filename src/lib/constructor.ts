import ts = require("typescript");
import { declareConst } from "./helpers";
import { paramNames, paramsVariableName } from "./paramsType";
import { windowVariableName } from "./windowExtensions";

export function createConstructorCall(className: ts.Identifier) {
	const constructorStatement = ts.factory.createIfStatement(
		ts.factory.createPropertyAccessExpression(
			windowVariableName,
			paramsVariableName
		),
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
	const windowParams = ts.factory.createPropertyAccessExpression(windowVariableName, paramsVariableName);

	const paramsName = ts.factory.createIdentifier("params")
	const paramsConst = declareConst(paramsName, windowParams)

	const initCall = ts.factory.createExpressionStatement(ts.factory.createCallExpression(
		ts.factory.createPropertyAccessExpression(ts.factory.createThis(), ts.factory.createIdentifier("init")),
		undefined,
		[
			ts.factory.createPropertyAccessExpression(paramsName, paramNames.context),
			ts.factory.createPropertyAccessExpression(paramsName, paramNames.noc),
			ts.factory.createPropertyAccessExpression(paramsName, paramNames.state),
			ts.factory.createPropertyAccessExpression(paramsName, paramNames.container)
		]
	))

	const updateViewCall = ts.factory.createExpressionStatement(ts.factory.createCallExpression(
		ts.factory.createPropertyAccessExpression(ts.factory.createThis(), ts.factory.createIdentifier("updateView")),
		undefined,
		[ts.factory.createPropertyAccessExpression(paramsName, paramNames.context)]
	))

	const thenBlock = ts.factory.createBlock([
		paramsConst,
		initCall,
		updateViewCall
	], true)

	const ifStatement = ts.factory.createIfStatement(
		windowParams,
		thenBlock
	)

	const existingBody = ctor?.body?.statements ?? ts.factory.createNodeArray([])

	const block = ts.factory.createBlock([
		ifStatement,
		...existingBody
	], true)

	return block
}