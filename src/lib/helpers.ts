import { BindingName, Expression, factory, Identifier, NodeFlags, ParenthesizedExpression, PropertyAccessExpression, SyntaxKind, ThisExpression } from "typescript";

export const declareConst = (name: BindingName, initializer: Expression) =>
	factory.createVariableStatement(undefined,
		factory.createVariableDeclarationList([
			factory.createVariableDeclaration(name, undefined, undefined, initializer)
		], NodeFlags.Const)
	);

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

export function access(...parts: (Identifier|ThisExpression|ParenthesizedExpression)[]): PropertyAccessExpression|Identifier|ThisExpression|ParenthesizedExpression {
	if (parts.length < 2) return parts[0]
	const val = parts.pop() as Identifier

	return factory.createPropertyAccessExpression(
		access(...parts),
		val
	)
}