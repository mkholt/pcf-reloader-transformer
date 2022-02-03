import socket from "socket.io-client";

const socketConfig = {
	"reconnectionAttempts": 50,
	"path": "/browser-sync/socket.io",
}

const hasData = (o: unknown): o is { data: unknown } => !!(o as { data: unknown })?.data

const timestamp = () => new Date().toLocaleTimeString([], {
	hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3
} as Intl.DateTimeFormatOptions)

const log = (...message: string[]) => console.log("[pcf-reloader]", "[" + timestamp() + "]", ...message)

type SocketIo = {
	on: (eventName: string, callback: (...args: unknown[]) => void) => SocketIo
	onevent: (packet: unknown) => void
	close: () => SocketIo
}

let _socket: SocketIo|null
let _websocket: WebSocket|null
export const connect = (self: unknown, baseUrl: string, onReload: () => void, debug?: boolean) => {
	const socketUrl = baseUrl + '/browser-sync'

	_socket = socket(socketUrl, socketConfig) as SocketIo
	_socket.on('disconnect', () => log("BrowserSync disconnected"))
	_socket.on('connect', () => log("BrowserSync connected"))
	_socket.on('browser:reload', () => {
		log("Reload triggered")
		onReload.call(self)
	})

	if (debug) {
		const onEvent = _socket.onevent
		_socket.onevent = function(packet: unknown) {
			onEvent.call(this, packet);

			if (hasData(packet))
				log("> " + JSON.stringify(packet.data))
		};
	}

	log("Live reload enabled on " + socketUrl)
}

export const disconnect = () => {
	if (_socket) {
		_socket.close()
	}

	if (_websocket) {
		_websocket.onmessage = null;
		_websocket.close();
	}
}

export const wsConnect = (self: unknown, address: string, onReload: () => void) => {
	_websocket = new WebSocket(address)
	_websocket.onmessage = (msg) => {
		if (msg.data !== "reload" && msg.data !== "refreshcss")
			return;
		log("Reload triggered")
		onReload.call(self)
	}

	log("Live reload enabled on " + address)
}
