import { writeFileSync } from 'fs';
import path from 'path';
import {
	createPrinter,
	EmitHint,
	Node,
	Printer,
	SourceFile,
} from 'typescript';

import { log } from '../injected/logger';
import { IPluginConfig } from '../pluginConfig';

const newPath = (fileName: string) => {
	const dirname = path.dirname(fileName)
	const nameParts = path.basename(fileName).split(".")

	const firstPart = nameParts.slice(0, nameParts.length - 1).join(".")
	const lastPart = nameParts[nameParts.length - 1]

	const newName = `${firstPart}.generated.${lastPart}`

	const generatedPath = path.resolve(dirname, newName)
	return generatedPath
}

let _printer: Printer|undefined
const printer = () => _printer ?? (_printer = createPrinter())

export const printNode = (node: Node, sourceFile: SourceFile) =>
	printer().printNode(EmitHint.Unspecified, node, sourceFile)

export default (sourceFile: SourceFile, updatedSource: SourceFile, opt: IPluginConfig) => {
	const generated = printNode(updatedSource, sourceFile)

	const generatedPath = newPath(sourceFile.fileName)
	writeFileSync(generatedPath, generated)

	if (opt.verbose) {
		log(`Generated file written to: ${generatedPath}`)
	}
}
