import { writeFileSync } from "fs";
import path = require("path");
import {
	createPrinter,
	EmitHint,
	Node,
	Printer,
	SourceFile,
} from "typescript";

import { IPluginConfig } from "../pluginConfig";

export const newPath = (fileName: string) => {
	const dirname = path.dirname(fileName)
	const nameParts = path.basename(fileName).split(".")
	const newName = nameParts.slice(0, nameParts.length - 1).join(".") + ".generated." + nameParts[nameParts.length - 1]
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
		console.log("Generated file written to: " + generatedPath)
	}
}