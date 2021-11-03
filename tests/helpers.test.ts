import { factory } from 'typescript'
import { print } from './utils/common'
import { access, declareConst, setVariable } from '../src/lib/helpers'

const id = factory.createIdentifier
const str = factory.createStringLiteral
test('declare const creates constant', () => {
	const node = declareConst(id("var1"), str("value1"))
	const source = print(node)

	expect(source).toBe("const var1 = \"value1\";")
})

test('declare const creates constant with reference', () => {
	const node = declareConst(id("var1"), id("value1"))
	const source = print(node)

	expect(source).toBe("const var1 = value1;")
})

test('can set variable to string', () => {
	const node = setVariable(id("var1"), str("value1"))
	expect(print(node)).toBe("var1 = \"value1\";")
})

test('can set variable to identifier', () => {
	const node = setVariable(id("var1"), factory.createThis())
	expect(print(node)).toBe("var1 = this;")
})

test('can build single level access', () => {
	const node = access(id('some'), id('object'))
	expect(print(node)).toBe("some.object")
})

test('can build multi level access', () => {
	const node = access(id('some'), id('object'), id('method'))
	expect(print(node)).toBe("some.object.method")
})

test('can build multi level call', () => {
	const node = factory.createCallExpression(access(id('some'), id('object'), id('method')), [], [id('param')])
	expect(print(node)).toBe("some.object.method(param)")
})