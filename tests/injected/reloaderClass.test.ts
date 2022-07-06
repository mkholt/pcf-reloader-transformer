/**
 * @jest-environment jsdom
 */

import {
	mock,
	mockClear,
} from 'jest-mock-extended';

import {
	fireEvent,
	getByTestId,
	queryByTestId,
} from '@testing-library/dom';

import {
	doConnect,
	StandardControl,
	UpdateBuilder,
} from '../../src/injected';
import * as logger from '../../src/injected/logger';

const logSpy = jest.spyOn(logger, 'log').mockImplementation().mockName('log')
const errorSpy = jest.spyOn(logger, 'error').mockImplementation().mockName('error')

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

	afterEach(() => {
		mockClear(component)
		jest.clearAllMocks()
		jest.useRealTimers()
		document.body.innerHTML = ''
	})

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

const getScriptTag = () => getByTestId<HTMLScriptElement>(document.body, "reloader-script")
const queryScriptTag = (): HTMLScriptElement|null => queryByTestId<HTMLScriptElement>(document.body, "reloader-script")

const initBaseMocks = () => {
	const context = mock<ComponentFramework.Context<unknown>>()
	const noc = jest.fn().mockName("notifyOutputChanged")
	const state = mock<ComponentFramework.Dictionary>()

	return {context, noc, state}
}

const initMocks = () => {
	const baseMocks = initBaseMocks()
	const container = document.createElement("div")
	document.body.appendChild(container)

	return {...baseMocks, container}
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
		new StandardControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		// Then
		expect(builder).toBeCalled()
	})

	it('calls connect and init', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new StandardControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		const {context, noc, state, container} = initMocks()

		// When
		reloader.init(context, noc, state, container)

		// Then
		expect(doConnect).toBeCalledWith(reloader, "SOCKET_URL")
		expect(wrapped.init).toHaveBeenCalledWith(context, noc, state, expect.any(HTMLElement))
		const [, , , containerWrapper] = wrapped.init.mock.calls[0]
		expect(getByTestId(container, "component-container")).toBe(containerWrapper)
	})

	it('does not wrap undefined container', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new StandardControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)
		const {context, noc, state} = initBaseMocks()

		// When
		reloader.init(context, noc, state, undefined)

		// Then
		expect(doConnect).toBeCalledWith(reloader, "SOCKET_URL")
		expect(wrapped.init).toHaveBeenCalledWith(context, noc, state, undefined)
	})

	it('calls updateView', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new StandardControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		const context = mock<ComponentFramework.Context<unknown>>()

		// When
		reloader.updateView(context)

		// Then
		expect(wrapped.updateView).toHaveBeenCalledWith(context)
	})

	it('calls disconnect and destroy', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new StandardControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		// When
		reloader.destroy()

		// Then
		expect(wrapped.destroy).toHaveBeenCalled()
	})

	it('can reload the component', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new StandardControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		const {context, noc, state, container} = initMocks()
		reloader.init(context, noc, state, container)

		jest.useFakeTimers().setSystemTime(999999999)

		// When
		reloader.reloadComponent()

		// Then
		expect(wrapped.destroy).toHaveBeenCalled()
		expect(getByTestId(document.body, "reloading-container")).toHaveTextContent("Reloading...")

		const newScriptTag = getScriptTag()
		expect(newScriptTag.src).toBe(currentScript.src + "#999999999")
	})

	it('will replace the tag on each reload', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new StandardControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		const {context, noc, state, container} = initMocks()
		reloader.init(context, noc, state, container)

		// When
		jest.useFakeTimers().setSystemTime(1000)
		reloader.reloadComponent()
		const newScriptTag = getScriptTag()
		expect(newScriptTag.src).toBe(currentScript.src + "#1000")

		jest.setSystemTime(2000)
		reloader.reloadComponent()

		// Then
		const finalScriptTag = getScriptTag()
		expect(finalScriptTag.src).toBe(currentScript.src + "#2000")
	})

	it('will initialize on onLoad', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new StandardControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		const {context, noc, state, container} = initMocks()
		reloader.init(context, noc, state, container)

		const newContext = mock<ComponentFramework.Context<unknown>>()
		reloader.updateView(newContext)
		reloader.reloadComponent()

		const newWrapped = mock<ComponentFramework.StandardControl<unknown, unknown>>()
		builder.mockReturnValueOnce(newWrapped)

		const newScriptTag = getScriptTag()

		// When
		fireEvent(newScriptTag, new Event("load"))

		// Then
		expect(builder).toHaveBeenCalledTimes(2)
		expect(newWrapped.init).toHaveBeenCalledWith(newContext, noc, state, expect.any(HTMLElement))
		expect(newWrapped.updateView).toHaveBeenCalledWith(newContext)
		expect(logSpy).toHaveBeenCalledWith(`Replacing wrapped instance of COMPONENT_NAME`)

		const [, , , containerWrapper] = wrapped.init.mock.calls[0]
		expect(getByTestId(container, "component-container")).toBe(containerWrapper)
	})

	it('allows manual reload on error', async () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new StandardControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		const {context, noc, state, container} = initMocks()
		reloader.init(context, noc, state, container)
		jest.useFakeTimers().setSystemTime(1000)

		reloader.reloadComponent()

		const newScriptTag = getScriptTag()
		jest.setSystemTime(2000)

		// When
		fireEvent(newScriptTag, new Event("error"))

		// Then
		expect(newScriptTag.src).toBe(currentScript.src + "#1000")

		expect(logSpy).not.toHaveBeenCalledWith(`Replacing wrapped instance of COMPONENT_NAME`)
		expect(errorSpy).toHaveBeenCalledWith("An error occurred loading the COMPONENT_NAME component:", undefined)

		const errorContainer = getByTestId(container, 'error-container')
		expect(errorContainer).toHaveTextContent("An error occurred loading the component COMPONENT_NAME - see console for details")
		
		const button = getByTestId(errorContainer, 'error-button-retry')
		expect(button).toHaveTextContent('Try again')

		fireEvent.click(button)

		const finalScriptTag = getScriptTag()
		expect(finalScriptTag.src).toBe(currentScript.src + "#2000")
	})

	it('does not allow manual reload if no container', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new StandardControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		jest.useFakeTimers().setSystemTime(1000)

		reloader.reloadComponent()

		const newScriptTag = getScriptTag()
		jest.setSystemTime(2000)

		// When
		fireEvent(newScriptTag, new Event("error"))

		// Then
		expect(newScriptTag.src).toBe(currentScript.src + "#1000")
		expect(errorSpy).toHaveBeenCalledWith("An error occurred loading the COMPONENT_NAME component:", undefined)
		expect(queryByTestId(document.body, 'error-container')).toBeNull()
	})

	it('allows manual reload on button', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new StandardControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		const {context, noc, state, container} = initMocks()
		reloader.init(context, noc, state, container)

		jest.useFakeTimers().setSystemTime(1000)
		const reloadButton = getByTestId(container, "reload-button-button")
		
		// When
		fireEvent.click(reloadButton)

		// Then
		const newScriptTag = getScriptTag()
		expect(newScriptTag.src).toBe(currentScript.src + "#1000")
	})

	it('does not render button if show force reload is false', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new StandardControl("COMPONENT_NAME", "SOCKET_URL", currentScript, false)

		const {context, noc, state, container} = initMocks()

		// When
		reloader.init(context, noc, state, container)

		// Then
		const reloadButton = queryByTestId(container, "reload-button-button")
		expect(reloadButton).toBeNull()
		expect(wrapped.init).toBeCalledWith(context, noc, state, container)
	})

	it('aborts if reloading without init', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new StandardControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		reloader.reloadComponent()

		const newWrapped = mock<ComponentFramework.StandardControl<unknown, unknown>>()
		builder.mockReturnValueOnce(newWrapped)

		const newScriptTag = getScriptTag()

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
		const reloader = new StandardControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		// When
		reloader.reloadComponent()

		// Then
		expect(builder).toHaveBeenCalledTimes(1)
		expect(queryScriptTag()).toBeNull()
	})

	it('aborts reload if script tag is not actual script', () => {
		// Given
		const scriptWrapper = document.createElement("div")
		const scriptTag = document.createElementNS("http://www.w3.org/2000/svg", "script")
		const currentScript = scriptWrapper.appendChild(scriptTag)
		
		const reloader = new StandardControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		// When
		reloader.reloadComponent()

		// Then
		expect(builder).toHaveBeenCalledTimes(1)
		expect(queryScriptTag()).toBeNull()
	})

	it('aborts reload if no script tag', () => {
		// Given
		const reloader = new StandardControl("COMPONENT_NAME", "SOCKET_URL", null, true)

		// When
		reloader.reloadComponent()

		// Then
		expect(builder).toHaveBeenCalledTimes(1)
		expect(queryScriptTag()).toBeNull()
	})

	it('handles no builder', () => {
		// Given
		const currentScript = scriptTag()
		getConstructors.mockReturnValueOnce(undefined)
		const {context, noc, state, container} = initMocks()

		// When
		const reloader = new StandardControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)
		reloader.init(context, noc, state, container)
		reloader.updateView(context)
		reloader.destroy()

		// Then
		expect(getConstructors).toBeCalledTimes(1)
		expect(builder).not.toBeCalled()
	})
})