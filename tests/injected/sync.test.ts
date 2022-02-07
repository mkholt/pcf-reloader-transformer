/**
 * @jest-environment jsdom
 */

import { mock } from "jest-mock-extended";
import { Server } from "mock-socket";
import waitForExpect from "wait-for-expect";

import {
	log,
	reloadComponent,
} from "../../src/injected";
import {
	doConnect,
	doDisconnect,
	ReloadParams,
} from "../../src/injected/sync";

jest.mock('../../src/injected/callouts', () => ({
	reloadComponent: jest.fn().mockName("reloadComponent")
}))

jest.mock('../../src/injected/logger', () => ({
	log: jest.fn().mockName("log")
}))

describe("sync integration (ws)", () => {
	const wsAddr = "ws://localhost:8080"

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

		doConnect(wsAddr, mock<ReloadParams>())
	})

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	it.each<any>(["reload","refreshcss"])('calls reload on "%s"', (message: string, done: jest.DoneCallback) => {
		const mockServer = new Server(wsAddr)

		mockServer.on('connection', (socket) => {
			expect(log).toBeCalledWith("Live reload enabled on " + wsAddr)

			socket.send(message)

			waitForExpect(() => {
				expect(reloadComponent).toHaveBeenCalled()
			}).then(() => {
				expect(log).toHaveBeenCalledWith("Reload triggered")
				mockServer.stop(done)
			})
		})

		doConnect(wsAddr, mock<ReloadParams>())
	})

	it("does not call on invalid message", (done) => {
		const mockServer = new Server(wsAddr)

		mockServer.on('connection', (socket) => {
			expect(log).toBeCalledWith("Live reload enabled on " + wsAddr)

			socket.send("unknown")

			waitForExpect(() => {
				expect(log).toHaveBeenCalledWith("> unknown")
			}).then(() => {
				expect(reloadComponent).not.toHaveBeenCalled()
				mockServer.stop(done)
			})
		})

		doConnect(wsAddr, mock<ReloadParams>(), true)
	})
})

describe("sync integration (bs)", () => {
	it("can connect", () => {
		// TODO
	})

	it("can disconnect", () => {
		// TODO
	})

	it("calls reload", () => {
		// TODO
	})

	it("logs messages", () => {
		// TODO
	})
})
