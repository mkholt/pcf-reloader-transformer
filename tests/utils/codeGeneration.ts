import {
	ConstructorDeclaration,
	createSourceFile,
	forEachChild,
	isClassDeclaration,
	isConstructorDeclaration,
	isMethodDeclaration,
	MethodDeclaration,
	Node,
	ScriptKind,
	ScriptTarget,
	SourceFile,
} from "typescript";

import { isDefined } from "./common";

export function buildClass(inner: string) {
	return `class test { ${inner} }`
}

type SourceProps = {
	sourceFile: SourceFile
	constructor?: ConstructorDeclaration
	method?: MethodDeclaration
}

export function extractMethod(source: string): SourceProps {
	const sourceFile = createSourceFile("test.ts", source, ScriptTarget.Latest, true, ScriptKind.TS)
	const classDef = forEachChild(sourceFile, (n: Node) => isClassDeclaration(n) ? n : undefined)
	isDefined(classDef)

	const constructor = forEachChild(classDef, (n: Node) => isConstructorDeclaration(n) ? n : undefined)
	const method = forEachChild(classDef, (n: Node) => isMethodDeclaration(n) ? n : undefined)

	return { constructor, method, sourceFile }
}
