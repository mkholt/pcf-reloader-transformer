import { readFileSync } from "fs"
import path from "path"
import { createPrinter, EmitHint, factory, NodeFlags, SyntaxKind, Node, SourceFile } from "typescript"

const printer = createPrinter()
const sourceFile = factory.createSourceFile([], factory.createToken(SyntaxKind.EndOfFileToken), NodeFlags.ContainsThis)

export function print(node: Node, collapse?: boolean) {
	const raw = printer.printNode(EmitHint.Unspecified, node, sourceFile)

	return collapse ? collapseString(raw) : raw
}

export function printFile(file: SourceFile, collapse?: boolean) {
	const raw = printer.printFile(file)

	return collapse ? collapseString(raw) : raw
}

export function collapseString(s: string) {
	return s.replace(/\n/g, ' ').replace(/\s\s+/g, ' ')
}

export function readFile(filename: string, subpath: string = "../../samples") {
	const filePath = path.resolve(__dirname, subpath, filename)
	const data = readFileSync(filePath).toString()

	return { data, filePath }
}
