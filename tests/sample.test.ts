import fs from "fs";
import path from "path";
import ts from "typescript";

import transformer from "../src/index";
import { log } from "../src/injected";
import { IPluginConfig } from "../src/pluginConfig";
import { readFile } from "./utils/common";

const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation().mockName("fs.writeFileSync")

jest.mock('../src/injected/logger', () => ({
	log: jest.fn().mockName("logger.log")
}))

describe('full sample compile', () => {
	beforeEach(() => {
		// Reset the spys and mocks
		jest.clearAllMocks()
	})

	test.each([
		'index',
		'initialClass',
		'noConstructor',
		'notMatching',
		'patched'
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

		const seps = filePath.replace(/\\/g, "/")
		const np = path.resolve(path.dirname(filePath), 'index.generated.ts')
		expect(log).toHaveBeenCalledWith(`Found class: SampleComponent in ${seps}:3`)
		expect(log).toHaveBeenCalledWith(`Generated file written to: ${np}`)
	})

	it('prints warning when skipping certain files', () => {

		const { data, filePath } = readFile(`patched.ts`)

		const pluginOptions: IPluginConfig = { verbose: true, printGenerated: true }

		ts.transpileModule(data, {
			fileName: filePath,
			transformers: {
				before: [transformer(pluginOptions)]
			}
		})

		const replaced = filePath.replace(/\\/g, "/")
		expect(log).toHaveBeenCalledWith(`PCF Reloader already injected, skipping ${replaced}`)
		expect(writeFileSpy).toHaveBeenCalledTimes(0)
	})
})
