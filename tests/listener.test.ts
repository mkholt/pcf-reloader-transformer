import { transpileModule } from "typescript"
import { createListenerMethod } from "../src/lib/listener"
import { print, readFile } from "./utils/common"
import transformer, { IPluginConfig } from "../src/index"

test('listener is created', () => {
	const listener = createListenerMethod()

	const text = print(listener, true)
	expect(text).toBe("private listenToWSUpdates(params: PcfReloadParams) { window.pcfReloadParams = params; const address = \"ws://127.0.0.1:8181/ws\"; const socket = new WebSocket(address); socket.onmessage = msg => { if (msg.data != \"reload\" && msg.data != \"refreshcss\") return; console.log(\"Reload triggered\"); this.destroy(); socket.onmessage = null; socket.close(); const isScript = (s: HTMLOrSVGScriptElement): s is HTMLScriptElement => !!(s as HTMLScriptElement).src; if (!currentScript || !isScript(currentScript)) return; const script = document.createElement(\"script\"); script.src = currentScript.src; const parent = currentScript.parentNode; if (!parent) return; currentScript.remove(); parent.appendChild(script); }; console.log(\"Live reload enabled on \" + address); }")
})

test('listener address can be specified', () => {
	const listener = createListenerMethod("wss://test.tld:8080/ws")

	const text = print(listener, true)
	expect(text).toBe("private listenToWSUpdates(params: PcfReloadParams) { window.pcfReloadParams = params; const address = \"wss://test.tld:8080/ws\"; const socket = new WebSocket(address); socket.onmessage = msg => { if (msg.data != \"reload\" && msg.data != \"refreshcss\") return; console.log(\"Reload triggered\"); this.destroy(); socket.onmessage = null; socket.close(); const isScript = (s: HTMLOrSVGScriptElement): s is HTMLScriptElement => !!(s as HTMLScriptElement).src; if (!currentScript || !isScript(currentScript)) return; const script = document.createElement(\"script\"); script.src = currentScript.src; const parent = currentScript.parentNode; if (!parent) return; currentScript.remove(); parent.appendChild(script); }; console.log(\"Live reload enabled on \" + address); }")
})

it('can specify listener address from options', () => {
	const { data, filePath } = readFile(`index.ts`)

	const address = "wss://some.tld:8283/wss"
	const pluginOptions: IPluginConfig = { wsAddress: address }

	const output = transpileModule(data, {
		fileName: filePath,
		transformers: {
			before: [transformer(pluginOptions)]
		}
	})

	const { data: result } = readFile(`index.js`, '../samples')

	const replaced = result.replace("ws://127.0.0.1:8181/ws", address)

	expect(output.outputText).toBe(replaced)
})