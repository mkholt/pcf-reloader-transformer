import * as ts from 'typescript';
//import { FilePrinter } from './lib/filePrinter';
import { visitor } from './visitors/sourceFileVisitor';
import { PluginConfig } from "ts-patch"
import FilePrinter from './lib/filePrinter';

export type IPluginConfig = PluginConfig & {
	printGenerated?: boolean,
	verbose?: boolean
}

export default (opts: IPluginConfig) =>
	(ctx: ts.TransformationContext) =>
		(sourceFile: ts.SourceFile) => {
			const updatedSource = ts.visitEachChild(sourceFile, visitor(sourceFile, opts, ctx), ctx)
			if (updatedSource == sourceFile) return sourceFile

			if (opts.printGenerated)
				FilePrinter(sourceFile, updatedSource, opts)			

			return updatedSource
		};