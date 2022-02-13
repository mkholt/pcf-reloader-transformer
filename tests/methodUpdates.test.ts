import {
	factory,
	MethodDeclaration,
} from "typescript";

import * as m from "../src/builders/methodUpdates";
import { IPluginConfig } from "../src/pluginConfig";
import {
	buildClass,
	extractMethod,
} from "./utils/codeGeneration";
import {
	isDefined,
	print,
} from "./utils/common";

const initBodyInner = 'const _pcfReloaderParams = { context: param0, notifyOutputChanged: param1, state: param2, container: param3 }; _pcfReloadLib.doConnect("http://localhost:8181", _pcfReloaderParams);'
const initBody = (oldBody: string) => `init(param0, param1, param2, param3) { ${initBodyInner}${oldBody} }`
const updateBody = (oldBody: string) => `updateView(context: ComponentFramework.Context<IInputs>) { _pcfReloadLib.onUpdateContext(context);${oldBody} }`

const parms = (count: number) => Array.from(Array(count).keys()).map((_, i) => 'param' + i).join(", ")

describe('method updates', () => {
	it.each`
	body					| description
	${"{}"}					| ${"empty"}
	${"{ console.log(); }"}	| ${"existing"}
	${""}					| ${"undefined"}
`("init method, body is $description", ({ body }: { body: string }) => {
		const { method } = extractMethod(buildClass(`init(param0, param1, param2, param3) ${body}`))
		isDefined(method)
		const source = handleMethodInternal(method)

		const normalized = body.replace("{", "").replace("}", "").trim()
		const oldBody = normalized.length ? " " + normalized : ""

		expect(source).toBe(initBody(oldBody))
	})

	it.each`
	body					| description
	${"{}"}					| ${"empty"}
	${"{ console.log(); }"}	| ${"existing"}
	${""}					| ${"undefined"}
	`("updateView body is $description", ({ body }: { body: string }) => {
		const { method } = extractMethod(buildClass(`updateView(context: ComponentFramework.Context<IInputs>) ${body}`))
		isDefined(method)
		const source = handleMethodInternal(method)

		const normalized = body.replace("{", "").replace("}", "").trim()
		const oldBody = normalized.length ? " " + normalized : ""

		expect(source).toBe(updateBody(oldBody))
	})

	test.each`
	func			| count
	${"init"}		| ${4}
	${"updateView"}	| ${1}
	`('$func not touched with too few parameter count (!= $count)', ({ func, count }) => {
		const { method } = extractMethod(buildClass(`${func}(${parms(count - 1)}) { }`))
		isDefined(method)
		const node = m.handleMethod(method, {})

		expect(node).toBeUndefined()
	})

	test.each`
	func			| count | inner
	${"init"}		| ${4}	| ${initBodyInner}
	${"updateView"}	| ${1}	| ${"_pcfReloadLib.onUpdateContext(param0);"}
	`('$func updated with too many parameters (!= $count)', ({ func, count, inner }) => {
		const p = parms(count + 1)
		const classDef = buildClass(`${func}(${p}) { }`)
		const { method } = extractMethod(classDef)
		isDefined(method)

		const source = handleMethodInternal(method)

		expect(source).toBe(`${func}(${p}) { ${inner} }`)
	})

	test.each`
	useBrowserSync | wsAddress                    | expected                     | description
	${undefined}   | ${undefined}                 | ${"http://localhost:8181"}   | ${"Defaults to BS on localhost"}
	${undefined}   | ${"http://example.tld:8080"} | ${"http://example.tld:8080"} | ${"Can override address on BS"}
	${true}        | ${undefined}                 | ${"http://localhost:8181"}   | ${"BS: Defaults to localhost"}
	${true}        | ${"http://example.tld:8080"} | ${"http://example.tld:8080"} | ${"BS: Can override address"}
	${false}       | ${undefined}                 | ${"ws://127.0.0.1:8181/ws"}  | ${"WS: Defaults to localhost"}
	${false}       | ${"ws://0.0.0.0:8080"}       | ${"ws://0.0.0.0:8080"}       | ${"WS: Can override address"}
	`('doConnect call, $description', ({ useBrowserSync, wsAddress, expected }) => {
		const p = parms(4)
		const classDef = buildClass(`init(${p}) {}`)
		const { method } = extractMethod(classDef)
		isDefined(method)

		const opts: IPluginConfig = {
			useBrowserSync,
			wsAddress
		}

		const source = handleMethodInternal(method, opts)
		
		expect(source).toBe(`init(${p}) { const _pcfReloaderParams = { context: param0, notifyOutputChanged: param1, state: param2, container: param3 }; _pcfReloadLib.doConnect("${expected}", _pcfReloaderParams); }`)
	})

	test('handleMethod returns undefined on unknown method', () => {
		const classDef = buildClass(`someMethod() {}`)
		const { method } = extractMethod(classDef)
		isDefined(method)

		const node = m.handleMethod(method, {})
		expect(node).toBeUndefined()
	})
})

function handleMethodInternal(method: MethodDeclaration, opts?: IPluginConfig) {
	const node = m.handleMethod(method, opts ?? {})
	isDefined(node)

	const methodDecl = factory.updateMethodDeclaration(method,
		method.decorators,
		method.modifiers,
		method.asteriskToken,
		method.name,
		method.questionToken,
		method.typeParameters,
		method.parameters,
		method.type,
		node)

	return print(methodDecl, true)
}
