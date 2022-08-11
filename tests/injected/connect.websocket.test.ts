/**
 * @jest-environment jsdom
 */

import { Server } from 'mock-socket';
import waitForExpect from 'wait-for-expect';

import { WebSocketConnection } from '../../src/injected/connect';
import { ComponentWrapper } from '../../src/injected/connect/connection';
import * as logger from '../../src/injected/logger';

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
		const connection = new WebSocketConnection(wsAddr)

		mockServer.on('connection', () => {
			expect(log).toBeCalledWith("Live reload enabled on " + wsAddr)
			connection.Disconnect()
		})

		mockServer.on('close', () => {
			expect(log).toBeCalledWith("Live reload disabled")
			mockServer.stop(done)
		})

		connection.Connect(reloader)
	})

	it.each<any>(["reload","refreshcss"])('calls reload on "%s"', (message: string, done: jest.DoneCallback) => {
		const mockServer = new Server(wsAddr)
		const connection = new WebSocketConnection(wsAddr)

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

		connection.Connect(reloader)
	})
})
