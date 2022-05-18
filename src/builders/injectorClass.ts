import {
	ClassDeclaration,
	factory,
	SyntaxKind,
} from 'typescript';

import { log } from '../injected';
import {
	access,
	accessLib,
	call,
	currentScriptName,
	id,
	stmt,
	toString,
} from '../lib';
import { IPluginConfig } from '../pluginConfig';
import {
	defaultAddress,
	getProtocol,
} from '../protocol';
import { ParameterNames } from './imports';

function getConnectionAddress(opts: IPluginConfig): string {
	const protocol = getProtocol(opts)
	const address = opts.wsAddress ?? defaultAddress(protocol)
	if (opts.verbose) log(`Using protocol: ${protocol}, binding to: ${address}`)

	return address
}

export function buildClass(className: string, parameterNames: ParameterNames, opts: IPluginConfig): ClassDeclaration {
	const heritage = factory.createHeritageClause(SyntaxKind.ExtendsKeyword, [
		factory.createExpressionWithTypeArguments(accessLib("ReloaderClass"), [
			factory.createTypeReferenceNode(id(parameterNames.input)),
			factory.createTypeReferenceNode(id(parameterNames.output))
		])
	])

	const debuggerCall = opts.debug ? [factory.createDebuggerStatement()] : []

	const connectionAddress = getConnectionAddress(opts)
	const classNameString = toString(className)
	const showForceReload = opts.showForceReload !== false ? factory.createTrue() : factory.createFalse()
	const superCall = stmt(call(factory.createSuper(), classNameString, toString(connectionAddress), access(currentScriptName), showForceReload))

	const members = [
		factory.createConstructorDeclaration(undefined, undefined, [], factory.createBlock([
			...debuggerCall,
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
