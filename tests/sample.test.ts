import fs from 'fs';
import path from 'path';
import ts from 'typescript';

import transformer from '../src/index';
import * as logger from '../src/injected/logger';
import { IPluginConfig } from '../src/pluginConfig';
import { readFile } from './utils/common';

const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation().mockName("fs.writeFileSync")

let wrappedClassName: string|undefined
const logSpy = jest.spyOn(logger, 'log').mockImplementation((...args) => {
	if (args[0] === "Wrapped classname:") {
		wrappedClassName = args[1]
	}
}).mockName("logger.log")

const getResult = (f: string) => {
	const { data: result } = readFile(`${f}.js`, '../samples')
	const hash = f == "patched" ? "" : (wrappedClassName ?? "_FAIL").slice(-5)
	return result.replace(/_HASH/g, hash);
}

describe('Full sample compile', () => {
	beforeEach(() => {
		// Reset the spys and mocks
		jest.clearAllMocks()
		wrappedClassName = undefined
	})

	test.each([
		'index',
		'initialClass',
		'noConstructor',
		'noExport',
		'notMatching',
		'notMatchingImplements',
		'notMatchingImplementsNotTypeReference',
		'notMatchingImplementsWithoutTypes',
		'notMatchingImplementsWrongTypeCount',
		'patched',
		'reactControl',
		'renamedParameters',
	])('can handle full file (%s)', (f) => {
		const { data, filePath } = readFile(`${f}.ts`)

		const pluginOptions: IPluginConfig = {
			verbose: true
		}

		const output = ts.transpileModule(data, {
			fileName: filePath,
			transformers: {
				before: [transformer(pluginOptions)]
			}
		})

		const resultText = getResult(f)
		expect(output.outputText).toBe(resultText)
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
		expect(logSpy).toHaveBeenCalledWith(`Found class: SampleComponent in ${seps}:3`)
		expect(logSpy).toHaveBeenCalledWith(`Generated file written to: ${np}`)
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
		expect(logSpy).toHaveBeenCalledWith(`PCF Reloader already injected, skipping ${replaced}`)
		expect(writeFileSpy).toHaveBeenCalledTimes(0)
	})

	it.each`
		useBrowserSync	| protocol			| address					  | connectionLib  | connectionName
		${true}			| ${'BrowserSync'}	| ${'http://localhost:8181'}  | ${'socketio'}  | ${'SocketIOConnection'}
		${false}		| ${'WebSocket'}	| ${'ws://127.0.0.1:8181/ws'} | ${'websocket'} | ${'WebSocketConnection'}
		${undefined}	| ${'BrowserSync'}	| ${'http://localhost:8181'}  | ${'socketio'}  | ${'SocketIOConnection'}
	`('can force protocol ($useBrowserSync)', ({useBrowserSync, protocol, address, connectionLib, connectionName}) => {
		const { data, filePath } = readFile(`index.ts`)

		const pluginOptions: IPluginConfig = {
			verbose: true,
			useBrowserSync: useBrowserSync
		}

		const output = ts.transpileModule(data, {
			fileName: filePath,
			transformers: {
				before: [transformer(pluginOptions)]
			}
		})

		const result = getResult("index.protocol")
		const replaced = result.replace("%%ADDRESS%%", address).replace("%%CONNECTIONLIB%%", connectionLib).replace("%%CONNECTION%%", connectionName)
		expect(output.outputText).toBe(replaced)

		const matcher = useBrowserSync === undefined
			? expect(logSpy)
			: expect(logSpy).not
		matcher.toHaveBeenCalledWith("Detected PCF Start version", expect.any(String))

		expect(logSpy).toHaveBeenCalledWith(`Using protocol: ${protocol}, binding to: ${address}`)
	})

	it.each`
		useBrowserSync	| addressIn					| protocol			| addressOut				 | connectionLib  | connectionName
		${undefined}	| ${'http://some.tld:8181'}	| ${'BrowserSync'}	| ${'http://some.tld:8181'}	 | ${'socketio'}  | ${'SocketIOConnection'}
		${true}			| ${'http://some.tld:8181'}	| ${'BrowserSync'}	| ${'http://some.tld:8181'}	 | ${'socketio'}  | ${'SocketIOConnection'}
		${false}		| ${'ws://127.0.0.1/ws'}	| ${'WebSocket'}	| ${'ws://127.0.0.1/ws'}	 | ${'websocket'} | ${'WebSocketConnection'}
		${undefined}	| ${undefined}				| ${'BrowserSync'}	| ${'http://localhost:8181'} | ${'socketio'}  | ${'SocketIOConnection'}
	`('can override address ($useBrowserSync, $addressIn)', ({useBrowserSync, addressIn, protocol, addressOut, connectionLib, connectionName}) => {
		const { data, filePath } = readFile(`index.ts`)

		const pluginOptions: IPluginConfig = {
			verbose: true,
			useBrowserSync: useBrowserSync,
			wsAddress: addressIn
		}

		const output = ts.transpileModule(data, {
			fileName: filePath,
			transformers: {
				before: [transformer(pluginOptions)]
			}
		})

		const result = getResult("index.protocol")
		const replaced = result.replace("%%ADDRESS%%", addressOut).replace("%%CONNECTIONLIB%%", connectionLib).replace("%%CONNECTION%%", connectionName)
		expect(output.outputText).toBe(replaced)
		expect(logSpy).toHaveBeenCalledWith(`Using protocol: ${protocol}, binding to: ${addressOut}`)
	})

	it.each`
		option			| showButton
		${true}			| ${true}
		${false}		| ${false}
		${undefined}	| ${true}
	`('can toggle force reload button ($option -> $showButton)', ({option, showButton}) => {
		const { data, filePath } = readFile(`index.ts`)

		const pluginOptions: IPluginConfig = {
			verbose: true,
			showForceReload: option
		}

		const output = ts.transpileModule(data, {
			fileName: filePath,
			transformers: {
				before: [transformer(pluginOptions)]
			}
		})

		const result = getResult("index.reloadButton")
		expect(output.outputText).toBe(result.replace("'%%SHOWBUTTON%%'", showButton))
	})

	it('can inject debugger calls', () => {
		const { data, filePath } = readFile(`index.ts`)
		const pluginOptions: IPluginConfig = {
			verbose: true,
			debug: true,
		}

		const output = ts.transpileModule(data, {
			fileName: filePath,
			transformers: {
				before: [transformer(pluginOptions)]
			}
		})

		const result = getResult("index.debugger")
		expect(output.outputText).toBe(result)
	})
})
