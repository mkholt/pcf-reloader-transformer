import {
	factory,
	SyntaxKind,
} from "typescript";

import {
	access,
	declareConst,
	id,
	paramsReference,
	paramsTypeName,
	reloadComponent,
	setVariable,
} from "./";

const syncLibName = id("_pcfReloadSyncLib")

export const listenCallName = id("_pcfReloadListen")
export const disconnectMethod = access(syncLibName, id("disconnect"))

export const createSyncImport = () => {
	const importLocation = factory.createStringLiteral("pcf-reloader-transformer/dist/injected/sync")

	const importDecl = declareConst(syncLibName, factory.createCallExpression(id("require"), undefined, [importLocation]))

	return importDecl
}


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
 * @param listeningAddress The address to listen to websocket messages on (defaults to ws://127.0.01:8181/ws for websocket and http://localhost:8181 for BrowserSync)
 * @returns An object containing the socket property declaration and the wsListener method
 */
export function createListenerMethod(listeningAddress?: string, useBrowserSync?: boolean) {
	const defaultAddress = useBrowserSync
		? "http://localhost:8181"
		: "ws://127.0.0.1:8181/ws"

	const syncAddress = factory.createStringLiteral(listeningAddress ?? defaultAddress)

	const methodName = useBrowserSync
		? id("connect")
		: id("wsConnect")

	const params = id("params")

	const call = factory.createCallExpression(access(syncLibName, methodName), undefined, [
		factory.createThis(),
		syncAddress,
		access(factory.createThis(), reloadComponent)
	])

	const body = factory.createBlock([
		setVariable(paramsReference, params),
		factory.createExpressionStatement(call)
	], true)

	const method = factory.createMethodDeclaration(undefined, [
		factory.createModifier(SyntaxKind.PrivateKeyword)
	], undefined, listenCallName, undefined, undefined, [
		factory.createParameterDeclaration(undefined, undefined, undefined, params, undefined,
			factory.createTypeReferenceNode(paramsTypeName))
	], undefined, body)

	return method
}
