import { factory, SyntaxKind } from "typescript";
import { paramsReference } from "./constructor";
import { access, declareConst, declareProperty, eqGreaterThan, setVariable } from "./helpers";
import { paramsTypeName } from "./paramsType";
import { reloadComponent } from "./refresher";

export const listenCallName = factory.createIdentifier("listenToWSUpdates")
const webSocketTypeName = factory.createIdentifier("WebSocket")
const webSocketFieldName = factory.createIdentifier("_reloadSocket")
export const webSocket = access(factory.createThis(), webSocketFieldName)
export const webSocketOnMessage = access(factory.createThis(), webSocketFieldName, factory.createIdentifier("onmessage"))
export const webSocketClose = access(factory.createThis(), webSocketFieldName, factory.createIdentifier("close"))

/**
 * Create the listenToWSUpdates.
 * 
 * ```
 * private listenToWSUpdates(params: PcfReloadParams) {
 *     window.pcfReloadParams = params;
 *     const address = "ws://127.0.0.1:8181/ws";
 *     const socket = new WebSocket(address);
 *     socket.onmessage = msg => {
 *         if (msg.data != "reload" && msg.data != "refreshcss")
 *             return;
 *         this.reloadComponent();
 *     };
 *     console.log("Live reload enabled on " + address);
 * }
 * ```
 * 
 * @param wsListeningAddress The address to listen to websocket messages on (defaults to ws://127.0.01:8181/ws)
 * @returns An object containing the socket property declaration and the wsListener method
 */
export function createListenerMethod(wsListeningAddress?: string) {
	const listeningAddress = factory.createStringLiteral(wsListeningAddress ?? "ws://127.0.0.1:8181/ws")

	const address = factory.createIdentifier("address")
	
	const params = factory.createIdentifier("params")

	const onMessageFunc = createOnMessageFunction()
	const body = factory.createBlock([
		setVariable(paramsReference, params),
		declareConst(address, listeningAddress),
		setVariable(webSocket, factory.createNewExpression(webSocketTypeName, undefined, [ address ])),
		setVariable(webSocketOnMessage, onMessageFunc),
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

	const propertyType = factory.createUnionTypeNode([
		factory.createTypeReferenceNode(webSocketTypeName),
		factory.createKeywordTypeNode(SyntaxKind.UndefinedKeyword)
	])

	const socketVarDecl = declareProperty(webSocketFieldName, propertyType)

	return { socketVarDecl, listener: method }
}

function createOnMessageFunction() {
	const msg = factory.createIdentifier("msg");

	const msgData = access(msg, factory.createIdentifier("data"))

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
		factory.createExpressionStatement(
			factory.createCallExpression(access(factory.createThis(), reloadComponent), undefined, undefined))
	], true)

	const functionDecl = factory.createArrowFunction(undefined,
		undefined, [
		factory.createParameterDeclaration(undefined, undefined, undefined, msg)
	], undefined, eqGreaterThan, body)

	return functionDecl
}
