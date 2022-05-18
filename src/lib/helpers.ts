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

import * as inject from '../injected';
import { injectLibName } from './names';

export type MethodName = keyof typeof inject

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

/**
 * Build access call to the given method in the injected code.
 * @param method The name of the method to call in the injected code
 * @returns An access call to the given method
 */
export const accessLib = (method: MethodName) =>
	access(injectLibName, id(method))

export const call = (callee: Expression, ...args: Expression[]) =>
	factory.createCallExpression(callee, undefined, args)

export const stmt = (expr: Expression) => factory.createExpressionStatement(expr)

export const writeLog = (...args: string[]) => call(accessLib("log"), ...args.map(a => toString(a)))