import { BindingName, Expression, factory, Identifier, NodeFlags, ParenthesizedExpression, PropertyAccessExpression, PropertyName, SyntaxKind, ThisExpression, TypeNode } from "typescript";

export const id = factory.createIdentifier

export const declareConst = (name: BindingName, initializer: Expression) =>
	declareVar(name, undefined, initializer, true)

export const declareVar = (name: BindingName, type?: TypeNode, initializer?: Expression, isConst = false) =>
	factory.createVariableStatement(undefined,
		factory.createVariableDeclarationList([
			factory.createVariableDeclaration(name, undefined, type, initializer)
		], isConst ? NodeFlags.Const : undefined)
	)

export const declareProperty = (name: PropertyName, type: TypeNode, isPrivate = false) => 
	factory.createPropertyDeclaration(
		undefined,
		isPrivate ? [factory.createModifier(SyntaxKind.PrivateKeyword)] : [],
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

export function access(...parts: (Identifier | ThisExpression | ParenthesizedExpression)[]): PropertyAccessExpression | Identifier | ThisExpression | ParenthesizedExpression {
	if (parts.length < 2) return parts[0]
	const val = parts.pop() as Identifier

	return factory.createPropertyAccessExpression(
		access(...parts),
		val
	)
}