import * as ts from 'typescript';
//import { FilePrinter } from './lib/filePrinter';
import { visitor } from './visitors/sourceFileVisitor';
import { PluginConfig } from "ts-patch"
import FilePrinter from './lib/filePrinter';
import { paramsTypeNameString } from './lib/paramsType';

export type IPluginConfig = PluginConfig & {
	printGenerated?: boolean,
	verbose?: boolean,
	wsAddress?: string,
}

export default (opts: IPluginConfig) =>
	(ctx: ts.TransformationContext) =>
		(sourceFile: ts.SourceFile) => {
			// Check: Source already has the type declared, if it does we've probably already handled this
			const existingTypeDef = ts.forEachChild(sourceFile, (n) =>
				ts.isTypeAliasDeclaration(n) && n.name.getText(sourceFile) === paramsTypeNameString
					? n
					: undefined
			)
			if (existingTypeDef) {
				if (opts.verbose) console.log("Params type already declared, skipping " + sourceFile.fileName)
				return sourceFile;
			}

			const updatedSource = ts.visitEachChild(sourceFile, visitor(sourceFile, opts, ctx), ctx)
			if (updatedSource == sourceFile) return sourceFile

			if (opts.printGenerated)
				FilePrinter(sourceFile, updatedSource, opts)

			return updatedSource
		};