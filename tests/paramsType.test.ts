import { createParamsType } from "../src/lib/paramsType"
import { print } from "./utils/common"

test('creates static type declaration', () => {
	const node = createParamsType()

	const sourceLines = print(node, true)
	expect(sourceLines).toStrictEqual("type PcfReloadParams = { context: ComponentFramework.Context<IInputs>; notifyOutputChanged: () => void; state: ComponentFramework.Dictionary; container: HTMLDivElement; };")
})