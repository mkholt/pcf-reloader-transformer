import { log } from "../../src/injected";

describe('Run-time console logger', () => {
	let messages: string[] = []
	const consoleSpy = jest.spyOn(console, 'log').mockImplementation((...m) => messages.push(m.join(' '))).mockName("console.log")

	beforeAll(() => {
		jest.useFakeTimers()
			.setSystemTime(new Date('2022-01-01 01:02:03.456'))
	})

	afterAll(() => {
		jest.useRealTimers()
	})

	beforeEach(() => {
		jest.clearAllMocks()
		messages = []
	})

	it("writes a test message", () => {
		log("Test")

		expect(consoleSpy).toHaveBeenCalledWith("[pcf-reloader]", "[01:02:03.456]", "Test")
		expect(messages).toEqual(expect.arrayContaining(["[pcf-reloader] [01:02:03.456] Test"]))
	})

	it("supports multiple messages", () => {
		log("Test", "Multiple", "Messages")

		expect(consoleSpy).toHaveBeenCalledWith("[pcf-reloader]", "[01:02:03.456]", "Test", "Multiple", "Messages")
		expect(messages).toEqual(expect.arrayContaining(["[pcf-reloader] [01:02:03.456] Test Multiple Messages"]))
	})
})
