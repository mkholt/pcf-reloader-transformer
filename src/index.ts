import ts from "typescript";

import { hasLibraryImport } from "./builders";
import FilePrinter from "./lib/filePrinter";
import { IPluginConfig } from "./pluginConfig";
import { visitor } from "./visitors";

export default (opts: IPluginConfig) =>
	(ctx: ts.TransformationContext) =>
		(sourceFile: ts.SourceFile) => {
			// Check: Source has import declaration, if yes, we back off
			if (hasLibraryImport(sourceFile)) {
				if (opts.verbose) console.log("PCF Reloader already injected, skipping " + sourceFile.fileName)
				return sourceFile;
			}

			// Analyze the source file and update if relevant
			const updatedSource = ts.visitEachChild(sourceFile, visitor(sourceFile, opts, ctx), ctx)

			// If the source was unchanged, abort
			if (updatedSource == sourceFile) return sourceFile

			// The source was changed, check if we want to print it for debugging
			if (opts.printGenerated)
				FilePrinter(sourceFile, updatedSource, opts)

			// Then return updated source
			return updatedSource
		}
