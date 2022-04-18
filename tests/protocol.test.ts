/* eslint-disable @typescript-eslint/no-var-requires */
describe('version to protocol mapping', () => {
	beforeEach(() => {
		jest.resetModules()
	})

	it.each`
	version			| protocol
	${undefined}	| ${"WebSocket"}
	${"0.1"}		| ${"WebSocket"}
	${"0.1.51"}		| ${"WebSocket"}
	${"0.2.59"}		| ${"WebSocket"}
	${"1.0.6"}		| ${"WebSocket"}
	${"1.3.3"}		| ${"WebSocket"}
	${"1.9.4"}		| ${"WebSocket"}
	${"1.11.2"}		| ${"WebSocket"}
	${"1.11.3"}		| ${"BrowserSync"}
	${"1.12.2"}		| ${"BrowserSync"}
	${"1.13.4"}		| ${"BrowserSync"}
	${"1.14.2"}		| ${"BrowserSync"}
	`('returns the right protocol ($version -> $protocol)', ({ version, protocol }) => {
		jest.mock('../src/injected/logger', () => ({ log: jest.fn().mockName("logger.log") }))
		jest.mock('pcf-start/package.json', () => ({ version }))

		const p = require("../src/protocol")
		const l = require("../src/injected/logger")
		
		const proto = p.getProtocol({ verbose: true })
		expect(proto).toBe(protocol)
		if (!version)
			expect(l.log).toBeCalledWith("Could not detect PCF Start version")
		else
			expect(l.log).toBeCalledWith("Detected PCF Start version", version)
	})

	it.each`
	useBrowserSync	| protocol
	${true}			| ${"BrowserSync"}
	${false}		| ${"WebSocket"}
	`('can override the version ($useBrowserSync -> $protocol)', ({ useBrowserSync, protocol }) => {
		jest.mock('../src/injected/logger', () => ({ log: jest.fn().mockName("logger.log") }))
		jest.mock('pcf-start/package.json', () => ({}))

		const p = require("../src/protocol")
		const l = require("../src/injected/logger")
		
		const proto = p.getProtocol({ verbose: true, useBrowserSync: useBrowserSync })
		expect(proto).toBe(protocol)
		expect(l.log).not.toBeCalled()
	})
})