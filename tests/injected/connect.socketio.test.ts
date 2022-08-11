import {
	createServer,
	Server as HttpServer,
} from 'http';
import { mock } from 'jest-mock-extended';
import {
	Namespace,
	Server as SocketIOServer,
} from 'socket.io';
import waitForExpect from 'wait-for-expect';

import { SocketIOConnection } from '../../src/injected/connect';
import { ComponentWrapper } from '../../src/injected/connect/connection';
import * as logger from '../../src/injected/logger';

const log = jest.spyOn(logger, 'log').mockImplementation().mockName('log')

describe("sync integration (bs)", () => {
	let wsAddr: string
	let httpServer: HttpServer
	let io: SocketIOServer
	let ns: Namespace

	const reloader: ComponentWrapper = {
		reloadComponent: jest.fn().mockName("reloadComponent")
	}

	beforeEach((done) => {
		httpServer = createServer()
		io = new SocketIOServer(httpServer, {
			allowEIO3: true,
			path: "/browser-sync/socket.io"
		})

		httpServer.listen(undefined, "localhost", () => {
			const addr = httpServer.address()
			if (!addr || typeof addr == "string") throw Error("Unexpected address: " + addr)
			wsAddr = "http://localhost:" + addr.port

			ns = io.of("/browser-sync")

			done()
		})
	})

	afterEach(() => {
		jest.clearAllMocks()
		io.close()
		httpServer.close()
	})

	it("can connect and disconnect", (done) => {
		const connection = new SocketIOConnection(wsAddr)

		ns.on("connection", (socket) => {
			expect(log).toBeCalledWith("Live reload enabled on " + wsAddr + "/browser-sync")
			waitForExpect(() => expect(log).toBeCalledWith("BrowserSync connected")).then(() => {
				connection.Disconnect()
			})

			socket.on("disconnect", () => {
				expect(log).toBeCalledWith("Live reload disabled")
				waitForExpect(() => expect(log).toBeCalledWith("BrowserSync disconnected")).then(done)
			})
		})

		const reloader = mock<ComponentWrapper>()
		connection.Connect(reloader)
	})

	it("calls reload", (done) => {
		const connection = new SocketIOConnection(wsAddr)
		ns.on("connection", (socket) => {
			socket.emit("browser:reload")

			waitForExpect(() => expect(log).toBeCalledWith("Reload triggered")).then(() => {
				expect(reloader.reloadComponent).toHaveBeenCalled()
				connection.Disconnect()
				done()
			})
		})

		connection.Connect(reloader)
	})
})
