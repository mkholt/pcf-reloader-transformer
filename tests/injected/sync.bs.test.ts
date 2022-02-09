/**
 * @jest-environment jsdom
 */

import { mock } from "jest-mock-extended";
import socket, { io } from "socket.io-client";
import SocketIoMock from "socket.io-mock";

import {
	doConnect,
	ReloadParams,
} from "../../src/injected/sync";
import {
	SocketClient,
	SocketMock,
} from "../socket.io-mock";

jest.mock('../../src/injected/callouts', () => ({
	reloadComponent: jest.fn().mockName("reloadComponent")
}))

jest.mock('../../src/injected/logger', () => ({
	log: jest.fn().mockName("log")
}))

jest.mock("socket.io-client", () => ({
	io: jest.fn(),
	socket: jest.fn()
}))
const mockIO = (io as unknown) as jest.MockedFunction<() => SocketClient>
const mockSocket = (socket as unknown) as jest.MockedFunction<() => SocketClient>

describe.skip("sync integration (bs)", () => {
	const wsAddr = "http://localhost"
	let socketServer: SocketMock
	let socketClient: SocketClient
	let port: number

	beforeAll(() => {
		socketServer = new SocketIoMock()
		socketClient = socketServer.socketClient

		socketServer.on("connect", () => {
			socketServer.emit("connect", { status: "success" })
		})

		mockIO.mockImplementation(() => {
			socketClient.emit("connect")
			return socketClient
		})

		mockSocket.mockImplementation(() => {
			socketClient.emit("connect")
			return socketClient
		})

	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it("can connect and disconnect", async () => {
		let serverReceivedConnect = false
		socketServer.on("connect", () => {
			serverReceivedConnect = true
		})

		doConnect(wsAddr + ":" + port, mock<ReloadParams>())

		await mockIO
		expect(mockIO).toHaveBeenCalledTimes(1)
		expect(serverReceivedConnect).toBeTruthy()
		/*const onConnect = () => {

			expect(log).toBeCalledWith("Live reload enabled on " + wsAddr + ":" + port + "/browser-sync")
			doDisconnect()
		}

		const onClose = () => {
			expect(log).toBeCalledWith("Live reload disabled")

			io.off("connection", onConnect)
			io.off("close", onClose)

			done()
		}

		io.on("connection", onConnect)
		io.on("close", onClose)*/
	})

	it("calls reload", () => {
		// TODO
	})

	it("logs messages", () => {
		// TODO
	})
})
