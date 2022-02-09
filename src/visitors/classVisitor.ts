import {
	factory,
	isConstructorDeclaration,
	isMethodDeclaration,
	Node,
} from "typescript";

import {
	createConstructorBody,
	handleMethod,
} from "../builders";
import { IPluginConfig } from "../pluginConfig";

export const classVisitor = (opts: IPluginConfig) =>
	(node: Node): Node | Node[] => {
		if (isConstructorDeclaration(node)) {
			const block = createConstructorBody(node)
			return factory.updateConstructorDeclaration(node, node.decorators, node.modifiers, node.parameters, block)
		}

		if (isMethodDeclaration(node)) {
			const functionBody = handleMethod(node, opts)
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
