/**
 * @jest-environment jsdom
 */

import {
	mock,
	mockClear,
	mockDeep,
} from "jest-mock-extended";

import * as injected from "../../src/injected";

describe('callout tests', () => {
	it('reads window params', () => {
		//expect({}).toBeNull()
	})
})

describe('callout method calls', () => {
	let injectMock: typeof injected
	const currentScript = document.createElement("script")

	const init = () => {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const sample = require("../samples/noConstructor")
		const sampleClass: ComponentFramework.StandardControl<unknown, unknown> = new sample.SampleComponent()
		const ctx = mock<ComponentFramework.Context<unknown>>()
		const container = document.createElement("div")

		return { sampleClass, ctx, container }
	}

	beforeAll(() => {
		injectMock = mockDeep<typeof injected>({
			hasParams: jest.fn().mockReturnValue(false)
		})
		jest.mock('pcf-reloader-transformer/dist/injected', () => injectMock)

		Object.defineProperty(global.document, "currentScript", { value: currentScript })
	})

	beforeEach(() => {
		mockClear(injectMock)
		jest.clearAllMocks()
	})

	it.each([true,false])("calls constructor when hasParams [$hasParams]", (hasParams: boolean) => {
		jest.isolateModules(() => {
			(injectMock.hasParams as jest.Mock<unknown,unknown[]>).mockReturnValueOnce(hasParams)

			const { sampleClass } = init()
			expect(injectMock.hasParams).toHaveBeenCalledTimes(1)
			expect(injectMock.onConstruct).toHaveBeenCalledTimes(hasParams ? 2 : 1)
			expect(injectMock.onConstruct).toHaveBeenCalledWith(sampleClass, currentScript)
		})
	})

	it('calls updateContext', () => {
		const { sampleClass, ctx, container } = init()

		sampleClass.init(ctx, jest.fn(), {}, container)
		sampleClass.updateView(ctx)

		expect(injectMock.onUpdateContext).toHaveBeenCalledWith(ctx)
	})

	it('calls connect on init', () => {
		const { sampleClass, ctx, container } = init()

		const noc = jest.fn()
		const state = mock<ComponentFramework.Dictionary>()
		sampleClass.init(ctx, noc, state, container)

		const params = expect.objectContaining<injected.ReloadParams>({
			context: ctx,
			container: container,
			notifyOutputChanged: noc,
			state: state
		})

		expect(injectMock.doConnect).toHaveBeenCalledWith(expect.any(String), params)
	})
})
