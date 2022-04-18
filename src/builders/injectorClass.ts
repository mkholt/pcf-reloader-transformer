import {
	ClassDeclaration,
	factory,
	SyntaxKind,
} from 'typescript';

import { log } from '../injected';
import {
	access,
	call,
	id,
	stmt,
	toString,
} from '../lib';
import { IPluginConfig } from '../pluginConfig';
import {
	defaultAddress,
	getProtocol,
} from '../protocol';
import { currentScriptName } from './currentScript';
import { accessLib } from './imports';

function getConnectionAddress(opts: IPluginConfig): string {
	const protocol = getProtocol(opts)
	const address = opts.wsAddress ?? defaultAddress(protocol)
	if (opts.verbose) log(`Using protocol: ${protocol}, binding to: ${address}`)

	return address
}

export function buildClass(className: string, wrappedClass: string, opts: IPluginConfig): ClassDeclaration {
	const heritage = factory.createHeritageClause(SyntaxKind.ExtendsKeyword, [
		factory.createExpressionWithTypeArguments(accessLib("ReloaderClass"), [
			factory.createTypeReferenceNode(wrappedClass),
			factory.createTypeReferenceNode(id("IInputs")),
			factory.createTypeReferenceNode(id("IOutputs"))
		])
	])

	const connectionAddress = getConnectionAddress(opts)
	const classNameString = toString(className)
	const showForceReload = opts.showForceReload !== false ? factory.createTrue() : factory.createFalse()
	const superCall = stmt(call(factory.createSuper(), classNameString, toString(connectionAddress), access(currentScriptName), showForceReload))

	const members = [
		factory.createConstructorDeclaration(undefined, undefined, [], factory.createBlock([
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
