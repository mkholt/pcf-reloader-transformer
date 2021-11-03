import { isConstructorDeclaration, Node } from "typescript"

export const constructorVisitor = (node: Node): Node|undefined => {
	if (isConstructorDeclaration(node)) return node
	return undefined
}