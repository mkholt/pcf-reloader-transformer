import {
	createServer,
	Server as HttpServer,
} from "http";
import { mock } from "jest-mock-extended";
import { Server as SocketIOServer } from "socket.io";
import waitForExpect from "wait-for-expect";

import { reloadComponent } from "../../src/injected/callouts";
import { log } from "../../src/injected/logger";
import {
	doConnect,
	doDisconnect,
	PcfReloaderWindow,
	ReloadParams,
} from "../../src/injected/sync";

jest.mock('../../src/injected/callouts', () => ({
	reloadComponent: jest.fn().mockName("reloadComponent")
}))

jest.mock('../../src/injected/logger', () => ({
	log: jest.fn().mockName("log")
}))

describe("sync integration (bs)", () => {
	let wsAddr: string
	let httpServer: HttpServer
	let io: SocketIOServer

	beforeAll(() => {
		Object.defineProperty(global, "window", {
			value: mock<PcfReloaderWindow>()
		})
	})

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
			done()
		})
	})

	afterEach(() => {
		jest.clearAllMocks()
		io.close()
		httpServer.close()
	})

	it("can connect and disconnect", (done) => {
		io.of("/browser-sync").on("connection", (socket) => {
			expect(log).toBeCalledWith("Live reload enabled on " + wsAddr + "/browser-sync")
			waitForExpect(() => expect(log).toBeCalledWith("BrowserSync connected")).then(() => {
				doDisconnect()
			})

			socket.on("disconnect", () => {
				expect(log).toBeCalledWith("Live reload disabled")
				waitForExpect(() => expect(log).toBeCalledWith("BrowserSync disconnected")).then(done)
			})
		})

		doConnect(wsAddr, mock<ReloadParams>())
	})

	it("calls reload", (done) => {
		io.of("/browser-sync").on("connection", (socket) => {
			socket.emit("browser:reload")

			waitForExpect(() => expect(reloadComponent).toHaveBeenCalled()).then(() => {
				expect(log).toBeCalledWith("Reload triggered")
				socket.disconnect(true)
				done()
			})
		})

		doConnect(wsAddr, mock<ReloadParams>())
	})

	it("does not call on invalid message", (done) => {
		io.of("/browser-sync").on("connection", (socket) => {
			socket.emit("unknown:event")

			waitForExpect(() => expect(log).toBeCalledWith("> [\"unknown:event\"]")).then(() => {
				expect(reloadComponent).not.toHaveBeenCalled()
				socket.disconnect(true)
				done()
			})
		})

		doConnect(wsAddr, mock<ReloadParams>(), true)
	})
})
