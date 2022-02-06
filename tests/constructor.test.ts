import ts from "typescript";

import * as c from "../src/builders/constructor";
import {
	buildClass,
	extractMethod,
} from "./utils/codeGeneration";
import {
	isDefined,
	print,
} from "./utils/common";

const constructorBody = (oldBody: string) => `constructor() { _pcfReloadLib.onConstruct(this, _pcfReloadCurrentScript);${oldBody} }`

describe('constructor builder', () => {
	test('constructor call is correct', () => {
		const ctor = c.createConstructorCall(ts.factory.createIdentifier("test"))

		const text = print(ctor, true)
		expect(text).toBe("if (_pcfReloadLib.hasParams()) new test();")
	})

	test('constructor is created', () => {
		const ctor = c.createConstructorDeclaration()

		const text = print(ctor, true)
		expect(text).toBe(constructorBody(""))
	})

	it.each`
	body					| description
	${"{}"}					| ${"empty"}
	${"{ console.log(); }"}	| ${"existing"}
	${""}					| ${"undefined"}
`("constructor, body is $description", ({ body }: { body: string }) => {
		const { constructor } = extractMethod(buildClass(`constructor() ${body}`))
		isDefined(constructor)

		const newBody = c.createConstructorBody(constructor)
		const ctorDecl = ts.factory.updateConstructorDeclaration(constructor,
			constructor.decorators,
			constructor.modifiers,
			constructor.parameters,
			newBody)

		const normalized = body.replace("{", "").replace("}", "").trim()
		const oldBody = normalized.length ? " " + normalized : ""
		const source = print(ctorDecl, true)
		expect(source).toBe(constructorBody(oldBody))
	})
})