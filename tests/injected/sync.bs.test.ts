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

import * as logger from '../../src/injected/logger';
import {
	ComponentWrapper,
	doConnect,
	doDisconnect,
} from '../../src/injected/sync';

const log = jest.spyOn(logger, 'log').mockImplementation().mockName('log')

describe("sync integration (bs)", () => {
	let wsAddr: string
	let httpServer: HttpServer
	let io: SocketIOServer
	let ns: Namespace

	const reloader = {
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
		ns.on("connection", (socket) => {
			expect(log).toBeCalledWith("Live reload enabled on " + wsAddr + "/browser-sync")
			waitForExpect(() => expect(log).toBeCalledWith("BrowserSync connected")).then(() => {
				doDisconnect()
			})

			socket.on("disconnect", () => {
				expect(log).toBeCalledWith("Live reload disabled")
				waitForExpect(() => expect(log).toBeCalledWith("BrowserSync disconnected")).then(done)
			})
		})

		const reloader = mock<ComponentWrapper>()

		doConnect(reloader, wsAddr)
	})

	it("calls reload", (done) => {
		ns.on("connection", (socket) => {
			socket.emit("browser:reload")

			waitForExpect(() => expect(log).toBeCalledWith("Reload triggered")).then(() => {
				expect(reloader.reloadComponent).toHaveBeenCalled()
				doDisconnect()
				done()
			})
		})

		doConnect(reloader, wsAddr)
	})

	it("does not call on invalid message", (done) => {
		ns.on("connection", (socket) => {
			socket.emit("unknown:event")

			waitForExpect(() => expect(log).toBeCalledWith("> [\"unknown:event\"]")).then(() => {
				expect(reloader.reloadComponent).not.toHaveBeenCalled()
				doDisconnect()
				done()
			})
		})

		doConnect(reloader, wsAddr, true)
	})
})
