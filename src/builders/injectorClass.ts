import {
	ClassDeclaration,
	factory,
	SyntaxKind,
} from 'typescript';

import { log } from '../injected';
import {
	access,
	accessControl,
	call,
	connectionLibName,
	ConnectionName,
	currentScriptName,
	declareConst,
	id,
	stmt,
	toString,
} from '../lib';
import { IPluginConfig } from '../pluginConfig';
import {
	defaultAddress,
	getProtocol,
	Protocol,
} from '../protocol';
import { ControlHeritage } from './imports';

export type ConnectionInfo = {
	protocol: Protocol
	address: string
	connectionName: ConnectionName
}

export function getConnectionInfo(opts: IPluginConfig): ConnectionInfo {
	const protocol = getProtocol(opts)
	const address = opts.wsAddress ?? defaultAddress(protocol)
	const connectionName = (protocol == 'BrowserSync')
		? "SocketIOConnection"
		: "WebSocketConnection"

	if (opts.verbose) log(`Using protocol: ${protocol}, binding to: ${address}`)

	return {
		protocol,
		address,
		connectionName
	}
}

export function buildClass(className: string, parameters: ControlHeritage, opts: IPluginConfig, connectionInfo: ConnectionInfo): ClassDeclaration {
	const heritage = factory.createHeritageClause(SyntaxKind.ExtendsKeyword, [
		factory.createExpressionWithTypeArguments(accessControl(parameters.controlType), [
			factory.createTypeReferenceNode(id(parameters.input)),
			factory.createTypeReferenceNode(id(parameters.output))
		])
	])

	const debuggerCall = opts.debug ? [factory.createDebuggerStatement()] : []

	const classNameString = toString(className)
	const showForceReload = opts.showForceReload !== false ? factory.createTrue() : factory.createFalse()

	const connectionConstName = id("connection")
	const connectionConstructor = factory.createNewExpression(access(connectionLibName, id(connectionInfo.connectionName)), undefined, [toString(connectionInfo.address)])
	const connectionVar = declareConst(connectionConstName, connectionConstructor)

	const superCall = stmt(call(factory.createSuper(), classNameString, access(connectionConstName), access(currentScriptName), showForceReload))

	const members = [
		factory.createConstructorDeclaration(undefined, undefined, [], factory.createBlock([
			...debuggerCall,
			connectionVar,
			superCall
		], true))
	]

	const classDeclaration = factory.createClassDeclaration(
		undefined,
		[factory.createModifier(SyntaxKind.ExportKeyword)],
		className,
		undefined,
		[heritage],
		members)

	return classDeclaration
}
