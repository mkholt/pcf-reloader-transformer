import path from "path"
import fs from "fs"
import ts from "typescript"
import transformer, { IPluginConfig } from "../src/index"
import { readFile } from "./utils/common"

let messages: string[] = []

const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation().mockName("fs.writeFileSync")
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation((m) => messages.push(m)).mockName("console.log")

beforeEach(() => {
	// Reset the spys
	jest.clearAllMocks()
	messages = []
})

test.each([
	'index',
	'index.noconstructor',
	'index.notouch',
	'index.default',
	'index.patched'
])('can handle full file (%s)', (f) => {
	const { data, filePath } = readFile(`${f}.ts`)

	const pluginOptions = {}

	const output = ts.transpileModule(data, {
		fileName: filePath,
		transformers: {
			before: [transformer(pluginOptions)]
		}
	})

	const { data: result } = readFile(`${f}.js`, '../samples')

	expect(output.outputText).toBe(result)
})


it('can output to file', () => {
	const { data, filePath } = readFile(`index.ts`)

	const pluginOptions: IPluginConfig = { printGenerated: true }

	ts.transpileModule(data, {
		fileName: filePath,
		transformers: {
			before: [transformer(pluginOptions)]
		}
	})

	const np = path.resolve(path.dirname(filePath), 'index.generated.ts')
	expect(writeFileSpy).toHaveBeenCalledWith(np, expect.any(String))
})

it('can be verbose', () => {
	const { data, filePath } = readFile(`index.ts`)

	const pluginOptions: IPluginConfig = { verbose: true, printGenerated: true }

	ts.transpileModule(data, {
		fileName: filePath,
		transformers: {
			before: [transformer(pluginOptions)]
		}
	})

	const seps = filePath.replace(/\\/g, "\/")
	const np = path.resolve(path.dirname(filePath), 'index.generated.ts')
	expect(consoleLogSpy).toHaveBeenCalledWith(`Found class: SampleComponent in ${seps}:3`)
	expect(consoleLogSpy).toHaveBeenCalledWith(`Generated file written to: ${np}`)
})

it('prints warning when skipping certain files', () => {
	
	const { data, filePath } = readFile(`index.patched.ts`)

	const pluginOptions: IPluginConfig = { verbose: true, printGenerated: true }

	ts.transpileModule(data, {
		fileName: filePath,
		transformers: {
			before: [transformer(pluginOptions)]
		}
	})

	const replaced = filePath.replace(/\\/g, "\/")
	expect(consoleLogSpy).toHaveBeenCalledWith(`Params type already declared, skipping ${replaced}`)
	expect(writeFileSpy).toHaveBeenCalledTimes(0)
})