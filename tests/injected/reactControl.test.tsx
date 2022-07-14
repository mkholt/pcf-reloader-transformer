/**
 * @jest-environment jsdom
 */

import React from 'react';

import { mock } from 'jest-mock-extended';

import {
	fireEvent,
	render,
	screen,
} from '@testing-library/react';

import { GetBuilder } from '../../src/injected/builder';
import { ReactControl } from '../../src/injected/react';
import { doConnect } from '../../src/injected/sync';
import {
	errorSpy,
	getScriptTag,
	initMocks,
	logSpy,
	queryScriptTag,
	scriptTag,
} from './control.base';

jest.mock('../../src/injected/sync', () => ({
	doConnect: jest.fn().mockName("doConnect"),
	doDisconnect: jest.fn().mockName("doDisconnect")
}))

jest.mock('../../src/injected/builder', () => ({
	UpdateBuilder: jest.fn().mockName("UpdateBuilder"),
	GetBuilder: jest.fn().mockName("GetBuilder")
}))


describe('React Wrapper class', () => {
	const getBuilderMock = GetBuilder as jest.Mock

	const mockWrapped = () => {
		const updateViewMock = jest.fn<React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>>, [ComponentFramework.Context<unknown>]>().mockName("updateView")
		const inner = <div>Hello, wrapped!</div>
		updateViewMock.mockReturnValue(inner)

		const wrapped = mock<ComponentFramework.ReactControl<unknown, unknown>>({
			updateView: updateViewMock
		});
		(GetBuilder as jest.Mock).mockReturnValue(() => wrapped)
	
		return wrapped
	}

	afterEach(() => {
		jest.clearAllMocks()
		jest.useRealTimers()
		document.body.innerHTML = ''
	})

	it('calls the builder on construction', () => {
		// Given
		const currentScript = scriptTag()

		// When
		new ReactControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		// Then
		expect(GetBuilder).toBeCalledWith("COMPONENT_NAME")
	})

	it('calls connect and init', () => {
		// Given
		const currentScript = scriptTag()
		const wrapped = mockWrapped()

		const reloader = new ReactControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)
		const {context, noc, state} = initMocks()

		// When
		reloader.init(context, noc, state)

		// Then
		expect(doConnect).toBeCalledWith(reloader, "SOCKET_URL")
		expect(wrapped.init).toHaveBeenCalledWith(context, noc, state, undefined)
	})

	it('calls updateView and returns component', () => {
		// Given
		const currentScript = scriptTag()
		const wrapped = mockWrapped()
		const reloader = new ReactControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		const context = mock<ComponentFramework.Context<unknown>>()

		// When
		const component = reloader.updateView(context)
		render(component)

		// Then
		expect(wrapped.updateView).toHaveBeenCalledWith(context)
		expect(component).not.toBeNull()
		expect(component).not.toBeUndefined()
		screen.findByText("Hello, wrapped!")
	})

	it('calls disconnect and destroy', () => {
		// Given
		const currentScript = scriptTag()
		const wrapped = mockWrapped()
		const reloader = new ReactControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		// When
		reloader.destroy()

		// Then
		expect(wrapped.destroy).toHaveBeenCalled()
	})

	it('can reload the component', () => {
		// Given
		const currentScript = scriptTag()
		const wrapped = mockWrapped()

		const reloader = new ReactControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		const {context, noc, state} = initMocks()
		reloader.init(context, noc, state)

		const component = reloader.updateView(context)
		render(component)

		jest.useFakeTimers().setSystemTime(999999999)

		// When
		reloader.reloadComponent()

		// Then
		expect(wrapped.destroy).toHaveBeenCalled()
		screen.findByText("Reloading...")

		const newScriptTag = getScriptTag()
		expect(newScriptTag.src).toBe(currentScript.src + "#999999999")
	})

	it('will replace the tag on each reload', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new ReactControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

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
		const reloader = new ReactControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		const {context, noc, state} = initMocks()
		reloader.init(context, noc, state)

		const newContext = mock<ComponentFramework.Context<unknown>>()
		reloader.updateView(newContext)
		reloader.reloadComponent()

		const newWrapped = mock<ComponentFramework.ReactControl<unknown, unknown>>()
		getBuilderMock.mockReturnValueOnce(() => newWrapped)

		const newScriptTag = getScriptTag()

		// When
		fireEvent(newScriptTag, new Event("load"))

		// Then
		expect(GetBuilder).toHaveBeenCalledTimes(2)
		expect(newWrapped.init).toHaveBeenCalledWith(newContext, noc, state, undefined)
		expect(newWrapped.updateView).toHaveBeenCalledWith(newContext)
		expect(logSpy).toHaveBeenCalledWith(`Replacing wrapped instance of COMPONENT_NAME`)
	})

	it('allows manual reload on error', async () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new ReactControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		const {context, noc, state} = initMocks()
		reloader.init(context, noc, state)
		const { getByRole } = render(reloader.updateView(context))

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

		jest.advanceTimersToNextTimer()

		expect(getByRole("alert")).toHaveTextContent("An error occurred loading the component")

		fireEvent.click(screen.getByText("Try again"))

		const finalScriptTag = getScriptTag()
		expect(finalScriptTag.src).toBe(currentScript.src + "#2000")
	})

	it('allows manual reload on button', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new ReactControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		const {context, noc, state} = initMocks()
		reloader.init(context, noc, state)

		render(reloader.updateView(context))

		jest.useFakeTimers().setSystemTime(1000)
		const reloadButton = screen.getByTitle("Refresh")
		
		// When
		fireEvent.click(reloadButton)

		// Then
		const newScriptTag = getScriptTag()
		expect(newScriptTag.src).toBe(currentScript.src + "#1000")
		screen.findByText("Reloading...")
	})

	it('does not render reload button if show force reload is false', () => {
		// Given
		const currentScript = scriptTag()
		const wrapped = mockWrapped()
		const reloader = new ReactControl("COMPONENT_NAME", "SOCKET_URL", currentScript, false)

		const {context, noc, state} = initMocks()
		reloader.init(context, noc, state)

		// When
		render(reloader.updateView(context))

		// Then
		expect(screen.queryByTitle("Refresh")).toBeNull()
		expect(wrapped.init).toBeCalledWith(context, noc, state, undefined)
	})

	it('aborts if reloading without init', () => {
		// Given
		const currentScript = scriptTag()
		const reloader = new ReactControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		reloader.reloadComponent()

		const newWrapped = mock<ComponentFramework.ReactControl<unknown, unknown>>()
		getBuilderMock.mockReturnValueOnce(() => newWrapped)

		const newScriptTag = getScriptTag()

		// When
		const event = new Event("load")
		newScriptTag.dispatchEvent(event)		

		// Then
		expect(GetBuilder).toHaveBeenCalledTimes(2)
		expect(newWrapped.init).not.toHaveBeenCalled()
		expect(newWrapped.updateView).not.toHaveBeenCalled()
		expect(logSpy).toHaveBeenCalledWith(`Replacing wrapped instance of COMPONENT_NAME`)
	})

	it('aborts reload without url', () => {
		// Given
		const currentScript = scriptTag("")
		const reloader = new ReactControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		// When
		reloader.reloadComponent()

		// Then
		expect(GetBuilder).toHaveBeenCalledTimes(1)
		expect(queryScriptTag()).toBeNull()
	})

	it('aborts reload if script tag is not actual script', () => {
		// Given
		const scriptWrapper = document.createElement("div")
		const scriptTag = document.createElementNS("http://www.w3.org/2000/svg", "script")
		const currentScript = scriptWrapper.appendChild(scriptTag)
		
		const reloader = new ReactControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)

		// When
		reloader.reloadComponent()

		// Then
		expect(GetBuilder).toHaveBeenCalledTimes(1)
		expect(queryScriptTag()).toBeNull()
	})

	it('aborts reload if no script tag', () => {
		// Given
		const reloader = new ReactControl("COMPONENT_NAME", "SOCKET_URL", null, true)

		// When
		reloader.reloadComponent()

		// Then
		expect(GetBuilder).toHaveBeenCalledTimes(1)
		expect(queryScriptTag()).toBeNull()
	})

	it('handles no builder', () => {
		// Given
		const currentScript = scriptTag()
		getBuilderMock.mockReturnValueOnce(undefined)
		const {context, noc, state} = initMocks()

		// When
		const reloader = new ReactControl("COMPONENT_NAME", "SOCKET_URL", currentScript, true)
		reloader.init(context, noc, state)
		reloader.updateView(context)
		reloader.destroy()

		// Then
		expect(GetBuilder).toBeCalledTimes(1)
	})
})