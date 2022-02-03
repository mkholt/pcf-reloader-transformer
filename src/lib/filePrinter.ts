import { writeFileSync } from "fs";
import path = require("path");
import {
	createPrinter,
	EmitHint,
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

export default (sourceFile: SourceFile, updatedSource: SourceFile, opt: IPluginConfig) => {
	const printer = createPrinter()
	const generated = printer.printNode(EmitHint.Unspecified, updatedSource, sourceFile)

	const generatedPath = newPath(sourceFile.fileName)
	writeFileSync(generatedPath, generated)

	if (opt.verbose) {
		console.log("Generated file written to: " + generatedPath)
	}
}