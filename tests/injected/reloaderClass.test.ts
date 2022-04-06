/**
 * @jest-environment jsdom
 */

import {
	mock,
	mockClear,
} from 'jest-mock-extended';

import {
	doConnect,
	ReloaderClass,
	UpdateBuilder,
} from '../../src/injected';
import * as logger from '../../src/injected/logger';

const logSpy = jest.spyOn(logger, 'log').mockImplementation().mockName('log')

jest.mock('../../src/injected/sync', () => ({
	doConnect: jest.fn().mockName("doConnect"),
	doDisconnect: jest.fn().mockName("doDisconnect")
}))

const init = () => {
	const getConstructors = jest.fn<undefined|Record<string, (() => ComponentFramework.StandardControl<unknown, unknown>)|undefined>, []>()
	const setConstructors = jest.fn<void, [Record<string, (() => ComponentFramework.StandardControl<unknown, unknown>)|undefined>]>()

	const component = mock<ComponentFramework.StandardControl<unknown, unknown>>({
		init: jest.fn(),
		updateView: jest.fn()
	})

	const wrapped = mock<ComponentFramework.StandardControl<unknown, unknown>>()
	const builder = jest.fn().mockName("COMPONENT_BUILDER").mockReturnValue(wrapped)

	beforeAll(() => {
		Object.defineProperty(global.window, "pcfConstructors", {
			configurable: true,
			get: getConstructors,
			set: setConstructors
		})

		getConstructors.mockReturnValue({
			"COMPONENT_NAME": builder
		})
	})

	beforeEach(() => {
		jest.clearAllMocks()
		mockClear(component)
	})

	afterEach(() => jest.useRealTimers())

	return { getConstructors, setConstructors, builder, wrapped }
}

const scriptTag = (src?: string) => {
	const scriptWrapper = document.createElement("div")

	const scriptTag = document.createElement("script")
	if (src !== "") {
		scriptTag.src = src ?? "http://example.com"
	}

	const currentScript = scriptWrapper.appendChild(scriptTag)

	return currentScript
}

describe('Wrapper class', () => {
	const { getConstructors, setConstructors, builder, wrapped } = init()

	it('stores builder function in window', () => {
		// Given
		getConstructors.mockReturnValueOnce(undefined)
		const builder = jest.fn().mockName("builder")

		// When
		UpdateBuilder("<component>", builder)

		// Then
		expect(setConstructors).toBeCalledWith({ "<component>": builder })
		expect(logSpy).toBeCalledWith("Updating builder function for <component>")
	})

	it('calls the builder on construction', () => {
		// Given
		const currentScript = scriptTag()

		// When
		new ReloaderClass("COMPONENT_NAME", "SOCKET_URL", currentScript)

		// Then
		expect(builder).toBeCalled()
	})

	it('calls connect and init', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new ReloaderClass("COMPONENT_NAME", "SOCKET_URL", currentScript)

		const context = mock<ComponentFramework.Context<unknown>>()
		const noc = jest.fn().mockName("notifyOutputChanged")
		const state = mock<ComponentFramework.Dictionary>()
		const container = document.createElement("div")

		// When
		reloader.init(context, noc, state, container)

		// Then
		expect(doConnect).toBeCalledWith(reloader, "SOCKET_URL")
		expect(wrapped.init).toHaveBeenCalledWith(context, noc, state, container)
	})

	it('calls updateView', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new ReloaderClass("COMPONENT_NAME", "SOCKET_URL", currentScript)

		const context = mock<ComponentFramework.Context<unknown>>()

		// When
		reloader.updateView(context)

		// Then
		expect(wrapped.updateView).toHaveBeenCalledWith(context)
	})

	it('calls disconnect and destroy', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new ReloaderClass("COMPONENT_NAME", "SOCKET_URL", currentScript)

		// When
		reloader.destroy()

		// Then
		expect(wrapped.destroy).toHaveBeenCalled()
	})

	it('can reload the component', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new ReloaderClass("COMPONENT_NAME", "SOCKET_URL", currentScript)

		const context = mock<ComponentFramework.Context<unknown>>()
		const noc = jest.fn().mockName("notifyOutputChanged")
		const state = mock<ComponentFramework.Dictionary>()
		const container = mock<HTMLDivElement>()
		reloader.init(context, noc, state, container)

		const appendChildSpy = jest.spyOn(window.document.body, "appendChild")
		jest.useFakeTimers().setSystemTime(999999999)

		// When
		reloader.reloadComponent()

		// Then
		expect(wrapped.destroy).toHaveBeenCalled()
		expect(container.replaceChildren).toHaveBeenCalledWith(expect.anything())
		expect(appendChildSpy).toHaveBeenCalled()

		const newScriptTag = appendChildSpy.mock.calls[0][0] as HTMLScriptElement
		expect(newScriptTag).not.toEqual(currentScript)
		expect(newScriptTag.src).toBe(currentScript.src + "#999999999")
	})

	it('will replace the tag on each reload', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new ReloaderClass("COMPONENT_NAME", "SOCKET_URL", currentScript)

		const context = mock<ComponentFramework.Context<unknown>>()
		const noc = jest.fn().mockName("notifyOutputChanged")
		const state = mock<ComponentFramework.Dictionary>()
		const container = mock<HTMLDivElement>()
		reloader.init(context, noc, state, container)

		const appendChildSpy = jest.spyOn(window.document.body, "appendChild")
		const removeChildSpy = jest.spyOn(window.document.body, "removeChild")
		jest.useFakeTimers().setSystemTime(1000)

		// When
		reloader.reloadComponent()

		jest.setSystemTime(2000)
		reloader.reloadComponent()

		// Then
		expect(appendChildSpy).toHaveBeenCalledTimes(2)

		const newScriptTag = appendChildSpy.mock.calls[0][0] as HTMLScriptElement
		expect(newScriptTag).not.toEqual(currentScript)
		expect(newScriptTag.src).toBe(currentScript.src + "#1000")
		expect(removeChildSpy).toHaveBeenCalledWith(newScriptTag)

		const secondScriptTag = appendChildSpy.mock.calls[1][0] as HTMLScriptElement
		expect(secondScriptTag).not.toEqual(newScriptTag)
		expect(secondScriptTag.src).toBe(currentScript.src + "#2000")
	})

	it('will initialize on onLoad', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new ReloaderClass("COMPONENT_NAME", "SOCKET_URL", currentScript)

		const context = mock<ComponentFramework.Context<unknown>>()
		const noc = jest.fn().mockName("notifyOutputChanged")
		const state = mock<ComponentFramework.Dictionary>()
		const container = mock<HTMLDivElement>()
		reloader.init(context, noc, state, container)

		const newContext = mock<ComponentFramework.Context<unknown>>()
		reloader.updateView(newContext)

		const appendChildSpy = jest.spyOn(window.document.body, "appendChild")
		reloader.reloadComponent()

		const newWrapped = mock<ComponentFramework.StandardControl<unknown, unknown>>()
		builder.mockReturnValueOnce(newWrapped)

		const newScriptTag = appendChildSpy.mock.calls[0][0] as HTMLScriptElement

		// When
		const event = new Event("load")
		newScriptTag.dispatchEvent(event)		

		// Then
		expect(builder).toHaveBeenCalledTimes(2)
		expect(newWrapped.init).toHaveBeenCalledWith(newContext, noc, state, container)
		expect(newWrapped.updateView).toHaveBeenCalledWith(newContext)
		expect(logSpy).toHaveBeenCalledWith(`Replacing wrapped instance of COMPONENT_NAME`)
	})

	it('aborts if reloading without init', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new ReloaderClass("COMPONENT_NAME", "SOCKET_URL", currentScript)

		const appendChildSpy = jest.spyOn(window.document.body, "appendChild")
		reloader.reloadComponent()

		const newWrapped = mock<ComponentFramework.StandardControl<unknown, unknown>>()
		builder.mockReturnValueOnce(newWrapped)

		const newScriptTag = appendChildSpy.mock.calls[0][0] as HTMLScriptElement

		// When
		const event = new Event("load")
		newScriptTag.dispatchEvent(event)		

		// Then
		expect(builder).toHaveBeenCalledTimes(2)
		expect(newWrapped.init).not.toHaveBeenCalled()
		expect(newWrapped.updateView).not.toHaveBeenCalled()
		expect(logSpy).toHaveBeenCalledWith(`Replacing wrapped instance of COMPONENT_NAME`)
	})

	it('aborts reload without url', () => {
		// Given
		const currentScript = scriptTag("")
		const reloader = new ReloaderClass("COMPONENT_NAME", "SOCKET_URL", currentScript)

		const appendChildSpy = jest.spyOn(window.document.body, "appendChild")

		// When
		reloader.reloadComponent()

		// Then
		expect(builder).toHaveBeenCalledTimes(1)
		expect(appendChildSpy).not.toHaveBeenCalled()
	})
})