import { isConstructorDeclaration, isMethodDeclaration, Node, factory } from "typescript"
import { createConstructorBody } from "../lib/constructor"
import { handleMethod } from "../lib/methodUpdates"

export const classVisitor = (node: Node): Node | Node[] => {
	if (isConstructorDeclaration(node)) {
		const block = createConstructorBody(node)
		return factory.updateConstructorDeclaration(node, node.decorators, node.modifiers, node.parameters, block)
	}

	if (isMethodDeclaration(node)) {
		const functionBody = handleMethod(node)
		if (functionBody) {
			return factory.updateMethodDeclaration(
				node,
				node.decorators,
				node.modifiers,
				node.asteriskToken,
				node.name,
				node.questionToken,
				node.typeParameters,
				node.parameters,
				node.type,
				functionBody
			)
		}
	}

	return node
}