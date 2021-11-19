import { factory, SyntaxKind } from "typescript";
import { currentScript } from "./currentScript";
import { access, declareConst, eqGreaterThan, setVariable } from "./helpers";
import { webSocketClose, webSocketOnMessage } from "./listener";

export const reloadComponent = factory.createIdentifier("reloadComponent")

const htmlScriptElement = factory.createIdentifier("HTMLScriptElement");

export function createRefreshMethod() {

	return factory.createMethodDeclaration(undefined, [
		factory.createModifier(SyntaxKind.PrivateKeyword)
	], undefined, reloadComponent, undefined, undefined, [], undefined, createBody())
}

function createBody() {
	const script = factory.createIdentifier("script");
	const parent = factory.createIdentifier("parent");

	return factory.createBlock([
		factory.createExpressionStatement(factory.createCallExpression(
			access(factory.createIdentifier("console"), factory.createIdentifier("log")),
			undefined, [ factory.createStringLiteral("Reload triggered") ]
		)),
		factory.createExpressionStatement(factory.createCallExpression(
			access(factory.createThis(), factory.createIdentifier("destroy")),
			undefined,
			undefined
		)),
		setVariable(webSocketOnMessage, factory.createNull()),
		factory.createExpressionStatement(factory.createCallExpression(webSocketClose, undefined, [])),
		declareConst(isScript, isScriptFunc()),
		factory.createIfStatement(factory.createBinaryExpression(
			factory.createPrefixUnaryExpression(
				SyntaxKind.ExclamationToken,
				currentScript
			),
			SyntaxKind.BarBarToken,
			callIsScript()
		),
			factory.createReturnStatement()
		),
		declareConst(script, createScriptElement()),
		setVariable(
			access(script, factory.createIdentifier("src")),
			access(currentScript, factory.createIdentifier("src"))
		),
		declareConst(parent, access(currentScript, factory.createIdentifier("parentNode"))
		),
		factory.createIfStatement(factory.createPrefixUnaryExpression(
			SyntaxKind.ExclamationToken,
			parent
		), factory.createReturnStatement()),
		factory.createExpressionStatement(factory.createCallExpression(access(currentScript, factory.createIdentifier("remove")), undefined, undefined)),
		factory.createExpressionStatement(factory.createCallExpression(access(parent, factory.createIdentifier("appendChild")), undefined, [ script ]))
	], true)
}

const isScriptFunc = () =>
	factory.createArrowFunction(undefined, undefined, [
		factory.createParameterDeclaration(undefined, undefined, undefined, "s", undefined,
			factory.createTypeReferenceNode("HTMLOrSVGScriptElement"),
			undefined
		)
	],
		factory.createTypePredicateNode(undefined,
			factory.createIdentifier("s"),
			factory.createTypeReferenceNode(htmlScriptElement)),
		eqGreaterThan,
		factory.createPrefixUnaryExpression(
			SyntaxKind.ExclamationToken,
			factory.createPrefixUnaryExpression(
				SyntaxKind.ExclamationToken,
				access(
					factory.createParenthesizedExpression(factory.createAsExpression(
						factory.createIdentifier("s"),
						factory.createTypeReferenceNode(
							htmlScriptElement,
							undefined
						)
					)),
					factory.createIdentifier("src")
				)
			)
		));

const isScript = factory.createIdentifier("isScript");
const callIsScript = () => factory.createPrefixUnaryExpression(
	SyntaxKind.ExclamationToken,
	factory.createCallExpression(isScript, undefined, [currentScript])
);

const createScriptElement = () =>
	factory.createCallExpression(
		access(
			factory.createIdentifier("document"),
			factory.createIdentifier("createElement")
		),
		undefined,
		[
			factory.createStringLiteral("script")
		]
	);