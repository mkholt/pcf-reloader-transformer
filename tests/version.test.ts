/* eslint-disable @typescript-eslint/no-var-requires */
describe('version to protocol mapping', () => {
	beforeEach(() => {
		jest.resetModules()
	})

	it.each`
	version | protocol
	${""}        | ${"WebSocket"}
	${"0.1"}     | ${"WebSocket"}
	${"0.1.51"}  | ${"WebSocket"}
	${"0.2.59"}  | ${"WebSocket"}
	${"1.0.6"}   | ${"WebSocket"}
	${"1.3.3"}   | ${"WebSocket"}
	${"1.3.6"}   | ${"WebSocket"}
	${"1.9.4"}   | ${"WebSocket"}
	${"1.11.2"}  | ${"WebSocket"}
	${"1.11.3"}  | ${"BrowserSync"}
	${"1.11.4"}  | ${"BrowserSync"}
	${"1.11.8"}  | ${"BrowserSync"}
	`('returns the right protocol ($version -> $protocol)', ({ version, protocol }) => {
		jest.mock('../src/injected/logger', () => ({ log: jest.fn().mockName("logger.log") }))
		jest.mock('pcf-start/package.json', () => ({ version }))

		const p = require("../src/version")
		const l = require("../src/injected/logger")
		
		const proto = p.getProtocol({ verbose: true })
		expect(proto).toBe(protocol)
		expect(l.log).toBeCalledWith("Detected PCF Start version", version)
	})
})