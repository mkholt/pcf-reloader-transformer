import ts from "typescript";

import * as c from "../src/lib/constructor";
import {
	buildClass,
	extractMethod,
} from "./utils/codeGeneration";
import { print } from "./utils/common";

test('constructor call is correct', () => {
	const ctor = c.createConstructorCall(ts.factory.createIdentifier("test"))

	const text = print(ctor, true)
	expect(text).toBe("if (window.pcfReloadParams) new test();")
})

test('constructor is created', () => {
	const ctor = c.createConstructorDeclaration()

	const text = print(ctor, true)
	expect(text).toBe("constructor() { if (window.pcfReloadParams) { const params = window.pcfReloadParams; this.init(params.context, params.notifyOutputChanged, params.state, params.container); this.updateView(params.context); } }")
})

it.each`
	body					| description
	${"{}"}					| ${"empty"}
	${"{ console.log(); }"}	| ${"existing"}
	${""}					| ${"undefined"}
`("constructor, body is $description", ({ body, description: _description }: { body: string, description: string }) => {
	const { constructor } = extractMethod(buildClass(`constructor() ${body}`))
	if (!constructor) expect(constructor).toBeDefined()

	const ctor = constructor!
	const newBody = c.createConstructorBody(ctor)
	const ctorDecl = ts.factory.updateConstructorDeclaration(ctor,
		ctor.decorators,
		ctor.modifiers,
		ctor.parameters,
		newBody)

	const normalized = body.replace("{", "").replace("}", "").trim()
	const oldBody = normalized.length ? " " + normalized : ""
	const source = print(ctorDecl, true)
	expect(source).toBe(`constructor() { if (window.pcfReloadParams) { const params = window.pcfReloadParams; this.init(params.context, params.notifyOutputChanged, params.state, params.container); this.updateView(params.context); }${oldBody} }`)
})