/**
 * @jest-environment jsdom
 */

import { Server } from 'mock-socket';
import waitForExpect from 'wait-for-expect';

import * as logger from '../../src/injected/logger';
import {
	ComponentWrapper,
	doConnect,
	doDisconnect,
} from '../../src/injected/sync';

const log = jest.spyOn(logger, 'log').mockImplementation().mockName("log")

describe("sync integration (ws)", () => {
	const wsAddr = "ws://localhost:8080"
	const reloader: ComponentWrapper = {
		reloadComponent: jest.fn().mockName("reloadComponent")
	}

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it("can connect and disconnect", (done) => {
		const mockServer = new Server(wsAddr)

		mockServer.on('connection', () => {
			expect(log).toBeCalledWith("Live reload enabled on " + wsAddr)
			doDisconnect()
		})

		mockServer.on('close', () => {
			expect(log).toBeCalledWith("Live reload disabled")
			mockServer.stop(done)
		})

		doConnect(reloader, wsAddr)
	})

	it.each<any>(["reload","refreshcss"])('calls reload on "%s"', (message: string, done: jest.DoneCallback) => {
		const mockServer = new Server(wsAddr)

		mockServer.on('connection', (socket) => {
			expect(log).toBeCalledWith("Live reload enabled on " + wsAddr)

			socket.send(message)

			waitForExpect(() => {
				expect(reloader.reloadComponent).toHaveBeenCalled()
			}).then(() => {
				expect(log).toHaveBeenCalledWith("Reload triggered")
				mockServer.stop(done)
			})
		})

		doConnect(reloader, wsAddr)
	})

	it("does not call on invalid message", (done) => {
		const mockServer = new Server(wsAddr)

		mockServer.on('connection', (socket) => {
			expect(log).toBeCalledWith("Live reload enabled on " + wsAddr)

			socket.send("unknown")

			waitForExpect(() => {
				expect(log).toHaveBeenCalledWith("> unknown")
			}).then(() => {
				expect(reloader.reloadComponent).not.toHaveBeenCalled()
				mockServer.stop(done)
			})
		})

		doConnect(reloader, wsAddr, true)
	})
})
