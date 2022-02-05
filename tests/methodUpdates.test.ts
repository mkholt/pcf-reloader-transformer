import {
	factory,
	MethodDeclaration,
} from "typescript";

import * as m from "../src/builders/methodUpdates";
import {
	buildClass,
	extractMethod,
} from "./utils/codeGeneration";
import {
	isDefined,
	print,
} from "./utils/common";

const initBodyInner = 'const _pcfReloaderParams = { context: param0, notifyOutputChanged: param1, state: param2, container: param3 }; _pcfReloadLib.connect(this, "http://localhost:8181", _pcfReloaderParams);'
const initBody = (oldBody: string) => `init(param0, param1, param2, param3) { ${initBodyInner}${oldBody} }`
const updateBody = (oldBody: string) => `updateView(context: ComponentFramework.Context<IInputs>) { _pcfReloadLib.updateContext(context);${oldBody} }`

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
	${"updateView"}	| ${1}	| ${"_pcfReloadLib.updateContext(param0);"}
	`('$func updated with too many parameters (!= $count)', ({ func, count, inner }) => {
		const p = parms(count + 1)
		const classDef = buildClass(`${func}(${p}) { }`)
		const { method } = extractMethod(classDef)
		isDefined(method)

		const source = handleMethodInternal(method)

		expect(source).toBe(`${func}(${p}) { ${inner} }`)
	})
})

function handleMethodInternal(method: MethodDeclaration) {
	const node = m.handleMethod(method, {})
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
