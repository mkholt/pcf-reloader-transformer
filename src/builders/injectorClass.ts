import { readFileSync } from "fs";
import {
	ClassDeclaration,
	createSourceFile,
	factory,
	Identifier,
	isClassDeclaration,
	ScriptKind,
	ScriptTarget,
	TransformationContext,
	visitEachChild,
} from "typescript";

import { log } from "../injected/logger";

export function buildClass(className: Identifier, languageVersion: ScriptTarget, ctx: TransformationContext): ClassDeclaration {
	log("Reading source")
	try {
		const source = readFileSync("../baseclass.ts").toString()
		log("Read source")
		const createdSourceFile = createSourceFile("injected.ts", source, languageVersion, undefined, ScriptKind.TS)
		log("Created source")

		let classDeclaration: ClassDeclaration | undefined
		visitEachChild(createdSourceFile, (n) => {
			if (isClassDeclaration(n)) {
				log("Is class: " + n.name?.getText(createdSourceFile))
				classDeclaration = factory.updateClassDeclaration(n,
					n.decorators,
					n.modifiers,
					className,
					n.typeParameters,
					n.heritageClauses,
					n.members)
			}

			return n
		}, ctx)

		log("Class: " + classDeclaration)
		if (!classDeclaration) throw Error("An unexpected error occurred parsing the injection")
		return classDeclaration
	} catch (e: unknown) {
		console.log(e)
		throw e
	}
}