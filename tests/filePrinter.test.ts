import path from "path"
import { newPath } from "../src/lib/filePrinter"

it.each`
	from				| to
	${'index.ts'}		| ${'index.generated.ts'}
	${'index.js'}		| ${'index.generated.js'}
	${'index.test.ts'}	| ${'index.test.generated.ts'}
	${'some.file.path'}	| ${'some.file.generated.path'}
`('can generate path ($from -> $to)', ({from, to}) => {
	const oldPath = path.resolve(__dirname, './samples/', from)
	const np = newPath(oldPath)

	const expected = path.resolve(__dirname, './samples/', to)
	expect(np).toBe(expected)
})