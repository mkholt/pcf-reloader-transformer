import ts from "typescript";

import { requireVarName } from "./builders";
import FilePrinter from "./lib/filePrinter";
import { IPluginConfig } from "./pluginConfig";
import { visitor } from "./visitors";

export * from "./injected"

export default (opts: IPluginConfig) =>
	(ctx: ts.TransformationContext) =>
		(sourceFile: ts.SourceFile) => {
			// Check: Source has import declaration, if yes, we back off
			const existingImportDecl = ts.forEachChild(sourceFile, (n) =>
				ts.isVariableStatement(n) &&
				n.declarationList?.declarations?.length &&
					n.declarationList.declarations[0].name.getText(sourceFile) === requireVarName
					? n
					: undefined
			)

			if (existingImportDecl) {
				if (opts.verbose) console.log("PCF Reloader already injected, skipping " + sourceFile.fileName)
				return sourceFile;
			}

			const updatedSource = ts.visitEachChild(sourceFile, visitor(sourceFile, opts, ctx), ctx)

			if (updatedSource == sourceFile) return sourceFile

			if (opts.printGenerated)
				FilePrinter(sourceFile, updatedSource, opts)

			return updatedSource
		}