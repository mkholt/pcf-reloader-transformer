/**
 * @jest-environment jsdom
 */

import {
	mock,
	mockClear,
} from 'jest-mock-extended';

import {
	GetBuilder,
	UpdateBuilder,
} from '../../src/injected/builder';
import * as logger from '../../src/injected/logger';

const logSpy = jest.spyOn(logger, 'log').mockImplementation().mockName('log')

describe("Builder function", () => {
	const getConstructors = jest.fn<undefined|Record<string, (() => ComponentFramework.StandardControl<unknown, unknown>)|undefined>, []>()
	const setConstructors = jest.fn<void, [Record<string, (() => ComponentFramework.StandardControl<unknown, unknown>)|undefined>]>()

	const component = mock<ComponentFramework.StandardControl<unknown, unknown>>({
		init: jest.fn(),
		updateView: jest.fn()
	})
	const builder = jest.fn().mockName("COMPONENT_BUILDER")

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
	})

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

	it('overwrites the existing function', () => {
		// Given
		const oldBuilder = jest.fn().mockName("oldBuilder")
		getConstructors.mockReturnValueOnce({ "<component>": oldBuilder })

		// When
		UpdateBuilder("<component>", builder)

		// Then
		expect(setConstructors).toBeCalledWith({ "<component>": builder })
		expect(logSpy).toBeCalledWith("Updating builder function for <component>")
	})

	it('can retrieve a builder function', () => {
		// Given
		const mockBuilder = jest.fn().mockName("builder")
		getConstructors.mockReturnValueOnce({ "<component>": mockBuilder})

		// When
		const builder = GetBuilder("<component>")

		// Then
		expect(builder).toBe(mockBuilder)
	})

	it('can handle multiple components', () => {
		// Given
		const mockBuilder = jest.fn().mockName("builder")
		getConstructors.mockReturnValueOnce({
			"<component>": mockBuilder,
			"WRONG": jest.fn().mockName("WRONG_BUILDER")
		})

		// When
		const builder = GetBuilder("<component>")

		// Then
		expect(builder).toBe(mockBuilder)
	})

	it('can handle no components', () => {
		// Given
		getConstructors.mockReturnValueOnce(undefined)

		// When
		const builder = GetBuilder("<component>")

		// Then
		expect(builder).toBeUndefined()
	})
})