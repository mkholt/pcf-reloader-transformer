import {
	factory,
	MethodDeclaration,
} from "typescript";

import * as m from "../src/builders/methodUpdates";
import { log } from "../src/injected/logger";
import { IPluginConfig } from "../src/pluginConfig";
import {
	getProtocol,
	Protocol,
} from "../src/version";
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

jest.mock('../src/version', () => ({ getProtocol: jest.fn<Protocol,never[]>().mockName("getProtocol") }))
jest.mock('../src/injected/logger', () => ({ log: jest.fn().mockName("logger.log") }))

describe('method updates', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(getProtocol as jest.Mock<Protocol,[IPluginConfig]>).mockReturnValue('BrowserSync')
	})

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

	type TestTuple = {
		useBrowserSync: boolean|undefined
		wsAddress: string|undefined
		expected: string
		protocol: Protocol
		using: Protocol
		description: string
	}
	test.each`
	useBrowserSync | wsAddress                    | expected                     | protocol         | using            | description
	${undefined}   | ${undefined}                 | ${"ws://127.0.0.1:8181/ws"}  | ${"WebSocket"}   | ${"WebSocket"}   | ${"Protocol used if not specified (WS)"}
	${undefined}   | ${undefined}                 | ${"http://localhost:8181"}   | ${"BrowserSync"} | ${"BrowserSync"} | ${"Protocol used if not specified (BS)"}
	${undefined}   | ${"http://example.tld:8080"} | ${"http://example.tld:8080"} | ${"BrowserSync"} | ${"BrowserSync"} | ${"Can override address on BS"}
	${undefined}   | ${"http://example.tld:8080"} | ${"http://example.tld:8080"} | ${"WebSocket"}   | ${"WebSocket"}   | ${"WS address takes precedence"}
	${true}        | ${undefined}                 | ${"http://localhost:8181"}   | ${"WebSocket"}   | ${"BrowserSync"} | ${"BS: Defaults to localhost"}
	${true}        | ${"http://example.tld:8080"} | ${"http://example.tld:8080"} | ${"WebSocket"}   | ${"BrowserSync"} | ${"BS: Can override address"}
	${false}       | ${undefined}                 | ${"ws://127.0.0.1:8181/ws"}  | ${"BrowserSync"} | ${"WebSocket"}   | ${"WS: Defaults to localhost"}
	${false}       | ${"ws://0.0.0.0:8080"}       | ${"ws://0.0.0.0:8080"}       | ${"BrowserSync"} | ${"WebSocket"}   | ${"WS: Can override address"}

	`('doConnect call, $description [$protocol]', ({ useBrowserSync, wsAddress, expected, protocol, using }: TestTuple) => {
		(getProtocol as jest.Mock<Protocol,IPluginConfig[]>).mockReturnValueOnce(protocol)
		
		const p = parms(4)
		const classDef = buildClass(`init(${p}) {}`)
		const { method } = extractMethod(classDef)
		isDefined(method)

		const opts: IPluginConfig = {
			useBrowserSync: useBrowserSync,
			wsAddress: wsAddress,
			verbose: true
		}

		const source = handleMethodInternal(method, opts)
		
		expect(source).toBe(`init(${p}) { const _pcfReloaderParams = { context: param0, notifyOutputChanged: param1, state: param2, container: param3 }; _pcfReloadLib.doConnect("${expected}", _pcfReloaderParams); }`)
		expect(log).toBeCalledWith("Detected protocol:", protocol)
		expect(log).toBeCalledWith("Using protocol:", using)
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
