import { factory, MethodDeclaration } from "typescript"
import { print } from "./utils/common"
import * as m from "../src/lib/methodUpdates"
import { buildClass, extractMethod } from "./utils/codeGeneration"

it.each`
	body					| description
	${"{}"}					| ${"empty"}
	${"{ console.log(); }"}	| ${"existing"}
	${""}					| ${"undefined"}
`("init method, body is $description", ({body, description: _description}: {body: string, description: string}) => {
	const { method } = extractMethod(buildClass(`init(param0, param1, param2, param3) ${body}`))
	if (!method) expect(method).toBeDefined()
	const source = handleMethodInternal(method!)

	const normalized = body.replace("{", "").replace("}", "").trim()
	const oldBody = normalized.length ? " " + normalized : ""
	expect(source).toBe(`init(param0, param1, param2, param3) { this.listenToWSUpdates({ context: param0, notifyOutputChanged: param1, state: param2, container: param3 });${oldBody} }`)
})

test('updateView body is built', () => {
	const { method } = extractMethod(buildClass("public updateView(context: ComponentFramework.Context<IInputs>): void { this._container.innerHTML = \"<div>Hello, world!</div>\" }"))
	if (!method) expect(method).toBeDefined()
	const source = handleMethodInternal(method!)

	// For some reason the printer doesn't print strings
	expect(source).toBe("public updateView(context: ComponentFramework.Context<IInputs>): void { if (window.pcfReloadParams) window.pcfReloadParams.context = context; this._container.innerHTML = ; }")
})

test.each`
	func			| count
	${"init"}		| ${4}
	${"updateView"}	| ${1}
`('$func not touched with wrong parameter count (!= $count)', ({func, count}) => {
	const parms = Array.from(Array(count - 1).keys()).map((_, i) => 'param' + i).join(", ")
	const { method } = extractMethod(buildClass(`${func}(${parms}) { }`))
	if (!method) expect(method).toBeDefined()
	const node = m.handleMethod(method!)

	expect(node).toBeUndefined()
})

test.each`
	func			| count
	${"init"}		| ${4}
	${"updateView"}	| ${1}
`('$func not touched with wrong parameter name', ({ func, count }) => {
	const parms = Array.from(Array(count).keys()).map((_, i) => `{ param${i} }`).join(", ")
	console.log(parms)
	const { method } = extractMethod(buildClass(`${func}(${parms}) { }`))

	if (!method) expect(method).toBeDefined()
	const node = m.handleMethod(method!)

	expect(node).toBeUndefined()
})

function handleMethodInternal(method: MethodDeclaration) {
	const node = m.handleMethod(method!)
	expect(node).toBeDefined()
	
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
