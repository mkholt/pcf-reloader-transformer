import {
	BindingName,
	Expression,
	factory,
	Identifier,
	NodeFlags,
	ParenthesizedExpression,
	PropertyAccessExpression,
	PropertyName,
	SyntaxKind,
	ThisExpression,
	TypeNode,
} from "typescript";

export const id = factory.createIdentifier

export const declareVar = (name: BindingName, isConst: boolean, type?: TypeNode, initializer?: Expression, isDeclare = false) =>
	factory.createVariableStatement(
		isDeclare ? [factory.createModifier(SyntaxKind.DeclareKeyword)] : undefined,
		factory.createVariableDeclarationList([
			factory.createVariableDeclaration(name, undefined, type, initializer)
		], isConst ? NodeFlags.Const : NodeFlags.Let | NodeFlags.ContextFlags)
	)

export const declareConst = (name: BindingName, initializer: Expression) =>
	declareVar(name, true, undefined, initializer)

export const declareProperty = (name: PropertyName, type: TypeNode) =>
	factory.createPropertyDeclaration(
		undefined,
		[factory.createModifier(SyntaxKind.PrivateKeyword)],
		name,
		undefined,
		type,
		undefined
	)

export const eqGreaterThan = factory.createToken(SyntaxKind.EqualsGreaterThanToken);

export function setVariable(leftHandSide: Expression, rightHandSide: Expression) {
	return factory.createExpressionStatement(
		factory.createBinaryExpression(
			leftHandSide,
			SyntaxKind.EqualsToken,
			rightHandSide
		)
	);
}

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

