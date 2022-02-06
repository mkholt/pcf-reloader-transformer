/**
 * @jest-environment jsdom
 */

import {
	mock,
	mockClear,
	mockDeep,
	mockReset,
} from "jest-mock-extended";

import * as injected from "../../src/injected";
import { ComponentType } from "../../src/injected";

const init = () => {
	const getParams = jest.fn()
	const setParams = jest.fn()

	const component = mock<ComponentType>({
		init: jest.fn(),
		updateView: jest.fn()
	})

	beforeAll(() => {
		Object.defineProperty(global.window, "pcfReloadParams", {
			configurable: true,
			get: getParams,
			set: setParams
		})
	})

	beforeEach(() => {
		jest.resetAllMocks()
		mockReset(component)
	})

	return { getParams, setParams, component }
}

describe('onConstruct', () => {
	const { getParams, component } = init()

	it('calls init and updateView if params are set', () => {
		getParams.mockReturnValue(mock<injected.ReloadParams>())		
		injected.onConstruct(component, document.createElement("script"))

		expect(component.init).toHaveBeenCalled()
		expect(component.updateView).toHaveBeenCalled()
	})

	it('does not call init and updateView if params are not set', () => {
		injected.onConstruct(component, document.createElement("script"))

		expect(component.init).not.toHaveBeenCalled()
		expect(component.updateView).not.toHaveBeenCalled()
	})
})

describe('hasParams', () => {
	const { getParams } = init()

	it('returns hasParams if params are set', () => {
		getParams.mockReturnValue(mock<injected.ReloadParams>())
		expect(injected.hasParams()).toBeTruthy()

		getParams.mockReturnValue(undefined)
		expect(injected.hasParams()).toBeFalsy()
	})
})

describe('onUpdateContext', () => {
	const { getParams, setParams } = init()
	it('updates the context in the params', () => {
		const oldParams = {
			container: document.createElement("div"),
			context: mock<ComponentFramework.Context<unknown>>(),
			notifyOutputChanged: jest.fn(),
			state: mock<ComponentFramework.Dictionary>()
		}
		getParams.mockReturnValue(oldParams)

		const newContext = mock<ComponentFramework.Context<unknown>>()

		injected.onUpdateContext(newContext)
		expect(getParams).toHaveBeenCalled()
		expect(setParams).toHaveBeenCalledWith(expect.objectContaining<Partial<injected.ReloadParams>>({
			context: newContext,
			container: oldParams.container,
			notifyOutputChanged: oldParams.notifyOutputChanged,
			state: oldParams.state
		}))
	})
})

describe('reloadComponent', () => {
	const getComponent = () => mock<ComponentType>({
		init: jest.fn(),
		updateView: jest.fn(),
		destroy: jest.fn()
	})

	const doDisconnect = jest.fn()
	beforeAll(() => {
		jest.mock('../../src/injected/sync', () => ({
			doDisconnect: doDisconnect
		}))
	})

	beforeEach(() => {
		jest.resetAllMocks()
	})

	it('reloads the component on reload', () => {
		jest.isolateModules(() => {
			const component = getComponent()

			const scriptWrapper = document.createElement("div")
			const scriptTag = document.createElement("script")
			scriptTag.src = "http://example.com"
			scriptTag.setAttribute("data-original", "yes")
			const currentScript = scriptWrapper.appendChild(scriptTag)

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const callouts = require('../../src/injected/callouts')
			callouts.onConstruct(component, currentScript)
			callouts.reloadComponent()

			// Disconnect websocket
			expect(doDisconnect).toHaveBeenCalled()

			// Destroy the component
			expect(component.destroy).toHaveBeenCalled()

			// Script element is replaced
			expect(scriptWrapper.innerHTML).toEqual('<script src="' + scriptTag.src + '"></script>')
		})
	})

	it('aborts without instance', () => {
		jest.isolateModules(() => {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const callouts = require('../../src/injected/callouts')
			callouts.reloadComponent()

			expect(doDisconnect).toHaveBeenCalled()
		})
	})

	it('aborts without current script', () => {
		jest.isolateModules(() => {
			const component = getComponent()

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const callouts = require('../../src/injected/callouts')
			callouts.onConstruct(component, null)
			callouts.reloadComponent()

			expect(doDisconnect).toHaveBeenCalled()
			expect(component.destroy).not.toHaveBeenCalled()
		})
	})

	it('aborts when currentscript is not script tag', () => {
		jest.isolateModules(() => {
			const component = getComponent()

			const scriptWrapper = document.createElement("div")
			const scriptTag = document.createElementNS("http://www.w3.org/2000/svg", "script")
			const currentScript = scriptWrapper.appendChild(scriptTag)

			const scriptWrapperHTML = scriptWrapper.innerHTML

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const callouts = require('../../src/injected/callouts')
			callouts.onConstruct(component, currentScript)
			callouts.reloadComponent()

			// Disconnect websocket
			expect(doDisconnect).toHaveBeenCalled()

			// Do not abort, since we cannot rebuild
			expect(component.destroy).not.toHaveBeenCalled()

			// Script element is NOT replaced
			expect(scriptWrapper.innerHTML).toEqual(scriptWrapperHTML)
		})
	})

	it('aborts when script has no parent', () => {
		jest.isolateModules(() => {
			const component = getComponent()

			const currentScript = document.createElement("script")
			currentScript.src = "http://example.tld"

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const callouts = require('../../src/injected/callouts')
			callouts.onConstruct(component, currentScript)
			callouts.reloadComponent()

			// Disconnect websocket
			expect(doDisconnect).toHaveBeenCalled()

			// Destroy the component
			expect(component.destroy).not.toHaveBeenCalled()
		})
	})
})

describe('updated code calls callout functions', () => {
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
