import { mock } from 'jest-mock-extended';

import {
	getByTestId,
	queryByTestId,
} from '@testing-library/dom';

import * as logger from '../../src/injected/logger';

export const logSpy = jest.spyOn(logger, 'log').mockImplementation().mockName('log')
export const errorSpy = jest.spyOn(logger, 'error').mockImplementation().mockName('error')

export const scriptTag = (src?: string) => {
	const scriptWrapper = document.createElement("div")

	const scriptTag = document.createElement("script")
	if (src !== "") {
		scriptTag.src = src ?? "http://example.com"
	}

	const currentScript = scriptWrapper.appendChild(scriptTag)

	return currentScript
}

export const getScriptTag = () => getByTestId<HTMLScriptElement>(document.body, "reloader-script")
export const queryScriptTag = (): HTMLScriptElement|null => queryByTestId<HTMLScriptElement>(document.body, "reloader-script")

export const initBaseMocks = () => {
	const context = mock<ComponentFramework.Context<unknown>>()
	const noc = jest.fn().mockName("notifyOutputChanged")
	const state = mock<ComponentFramework.Dictionary>()

	return {context, noc, state}
}

export const initMocks = () => {
	const baseMocks = initBaseMocks()
	const container = document.createElement("div")
	document.body.appendChild(container)

	return {...baseMocks, container}
}
