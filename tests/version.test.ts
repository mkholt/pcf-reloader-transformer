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
		jest.mock('pcf-start/package.json', () => ({ version }))

		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const p = require("../src/version")
		
		const proto = p.getProtocol()
		expect(proto).toBe(protocol)
	})
})