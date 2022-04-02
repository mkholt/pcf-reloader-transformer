import {
	BindingName,
	Expression,
	factory,
	Identifier,
	NodeFlags,
	ParenthesizedExpression,
	PropertyAccessExpression,
	SyntaxKind,
	ThisExpression,
} from 'typescript';

export const id = factory.createIdentifier
export const toString = factory.createStringLiteral

export const declareConst = (name: BindingName, initializer: Expression) =>
	factory.createVariableStatement(
		undefined,
		factory.createVariableDeclarationList([
			factory.createVariableDeclaration(name, undefined, undefined, initializer)
		], NodeFlags.Const)
	)

export const fatArrow = factory.createToken(SyntaxKind.EqualsGreaterThanToken);

export type AccessPart = Identifier | ThisExpression | ParenthesizedExpression
export type AccessExpression = PropertyAccessExpression | AccessPart
export const access = (...parts: AccessPart[]): AccessExpression => {
	if (parts.length < 2) return parts[0]
	const val = parts.pop() as Identifier

	return factory.createPropertyAccessExpression(
		access(...parts),
		val
	)
}

export const call = (callee: Expression, ...args: Expression[]) =>
	factory.createCallExpression(callee, undefined, args)

export const stmt = (expr: Expression) => factory.createExpressionStatement(expr)
