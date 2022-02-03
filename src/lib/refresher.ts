import {
	factory,
	SyntaxKind,
} from "typescript";

import {
	access,
	currentScript,
	declareConst,
	eqGreaterThan,
	id,
	setVariable,
} from "./";
import { disconnectMethod } from "./listener";

export const reloadComponent = id("_pcfReloadComponent")

const htmlScriptElement = id("HTMLScriptElement");

/**
 * Create the declaration of the reloadComponent method
 * 
 * ```
 * private reloadComponent() {
 *     console.log("Reload triggered");
 *     this.destroy();
 *     if (this._reloadSocket) {
 *         this._reloadSocket.onmessage = null;
 *         this._reloadSocket.close();
 *     }
 *     const isScript = (s: HTMLOrSVGScriptElement): s is HTMLScriptElement => !!(s as HTMLScriptElement).src;
 *     if (!currentScript || !isScript(currentScript))
 *         return;
 *     const script = document.createElement("script");
 *     script.src = currentScript.src;
 *     const parent = currentScript.parentNode;
 *     if (!parent)
 *         return;
 *     currentScript.remove();
 *     parent.appendChild(script);
 * }
 * ```
 * 
 * @returns The reloadComponent method
 */
export function createRefreshMethod() {
	return factory.createMethodDeclaration(undefined, [
		factory.createModifier(SyntaxKind.PrivateKeyword)
	], undefined, reloadComponent, undefined, undefined, [], undefined, createBody())
}

const isScript = id("isScript");
const callIsScript = () => factory.createPrefixUnaryExpression(
	SyntaxKind.ExclamationToken,
	factory.createCallExpression(isScript, undefined, [currentScript])
);

const isScriptFunc = () =>
	factory.createArrowFunction(
		undefined, undefined, [
			factory.createParameterDeclaration(undefined, undefined, undefined, "s", undefined,
				factory.createTypeReferenceNode("HTMLOrSVGScriptElement"),
				undefined
			)],
		factory.createTypePredicateNode(undefined,
			id("s"),
			factory.createTypeReferenceNode(htmlScriptElement)),
		eqGreaterThan,
		factory.createPrefixUnaryExpression(
			SyntaxKind.ExclamationToken,
			factory.createPrefixUnaryExpression(
				SyntaxKind.ExclamationToken,
				access(
					factory.createParenthesizedExpression(factory.createAsExpression(
						id("s"),
						factory.createTypeReferenceNode(
							htmlScriptElement,
							undefined
						)
					)),
					id("src")
				)
			)
		));


const createScriptElement = () =>
	factory.createCallExpression(
		access(
			id("document"),
			id("createElement")
		),
		undefined,
		[
			factory.createStringLiteral("script")
		]
	);


function createBody() {
	const script = id("script");
	const parent = id("parent");

	const callDestroy = factory.createExpressionStatement(factory.createCallExpression(
		access(factory.createThis(), id("destroy")),
		undefined,
		undefined
	))

	const stopListening = factory.createExpressionStatement(factory.createCallExpression(
		disconnectMethod, undefined, []
	))

	const returnIfNoScript = factory.createIfStatement(factory.createBinaryExpression(
		factory.createPrefixUnaryExpression(
			SyntaxKind.ExclamationToken,
			currentScript
		),
		SyntaxKind.BarBarToken,
		callIsScript()), factory.createReturnStatement())

	const returnIfNoParent = factory.createIfStatement(factory.createPrefixUnaryExpression(
		SyntaxKind.ExclamationToken,
		parent
	), factory.createReturnStatement())

	return factory.createBlock([
		callDestroy,
		stopListening,
		declareConst(isScript, isScriptFunc()),
		returnIfNoScript,
		declareConst(script, createScriptElement()),
		setVariable(
			access(script, id("src")),
			access(currentScript, id("src"))
		),
		declareConst(parent, access(currentScript, id("parentNode"))
		),
		returnIfNoParent,
		factory.createExpressionStatement(factory.createCallExpression(access(currentScript, id("remove")), undefined, undefined)),
		factory.createExpressionStatement(factory.createCallExpression(access(parent, id("appendChild")), undefined, [script]))
	], true)
}
