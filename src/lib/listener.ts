import { factory, SyntaxKind, Identifier } from "typescript";
import { currentScript } from "./currentScript";
import { access, declareConst, eqGreaterThan, setVariable } from "./helpers";
import { paramsTypeName, paramsVariableName } from "./paramsType";
import { windowVariableName } from "./windowExtensions";

export const listenCallName = factory.createIdentifier("listenToWSUpdates")
const msg = factory.createIdentifier("msg");
const onMessage = factory.createIdentifier("onmessage");
const webSocket = factory.createIdentifier("WebSocket");
const htmlScriptElement = factory.createIdentifier("HTMLScriptElement");

export function createListenerMethod(wsListeningAddress?: string) {
	const address = factory.createIdentifier("address")
	const socket = factory.createIdentifier("socket")
	
	const params = factory.createIdentifier("params")

	const body = factory.createBlock([
		setVariable(
			access(windowVariableName, paramsVariableName),
			params
		),
		declareConst(address, factory.createStringLiteral(wsListeningAddress ?? "ws://127.0.0.1:8181/ws")),
		declareConst(socket, factory.createNewExpression(webSocket, undefined, [ address ])),
		setVariable(access(socket, onMessage), createOnMessageFunction(socket)),
		factory.createExpressionStatement(
			factory.createCallExpression(
				access(factory.createIdentifier("console"), factory.createIdentifier("log")), undefined, [
					factory.createBinaryExpression(
						factory.createStringLiteral("Live reload enabled on "),
						SyntaxKind.PlusToken,
						address
					)
				]
			)
		)
	], true)

	const method = factory.createMethodDeclaration(undefined, [
		factory.createModifier(SyntaxKind.PrivateKeyword)
	], undefined, listenCallName, undefined, undefined, [
		factory.createParameterDeclaration(undefined, undefined, undefined, params, undefined,
			factory.createTypeReferenceNode(paramsTypeName))
	], undefined, body)

	return method
}

function createOnMessageFunction(socket: Identifier) {
	const msgData = access(msg, factory.createIdentifier("data"))

	const script = factory.createIdentifier("script");
	const parent = factory.createIdentifier("parent");

	const body = factory.createBlock([
		factory.createIfStatement(factory.createBinaryExpression(
			factory.createBinaryExpression(
				msgData,
				SyntaxKind.ExclamationEqualsToken,
				factory.createStringLiteral("reload")
			),
			SyntaxKind.AmpersandAmpersandToken,
			factory.createBinaryExpression(
				msgData,
				SyntaxKind.ExclamationEqualsToken,
				factory.createStringLiteral("refreshcss")
			)
		), factory.createReturnStatement(undefined)),
		factory.createExpressionStatement(factory.createCallExpression(
			access(factory.createIdentifier("console"), factory.createIdentifier("log")),
			undefined, [ factory.createStringLiteral("Reload triggered") ]
		)),
		factory.createExpressionStatement(factory.createCallExpression(
			access(factory.createThis(), factory.createIdentifier("destroy")),
			undefined,
			undefined
		)),
		setVariable(access(socket, onMessage), factory.createNull()),
		factory.createExpressionStatement(factory.createCallExpression(
			access(socket, factory.createIdentifier("close")), undefined, []
		)),
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

	const functionDecl = factory.createArrowFunction(undefined,
		undefined, [
		factory.createParameterDeclaration(undefined, undefined, undefined, msg)
	], undefined, eqGreaterThan, body)

	return functionDecl
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
