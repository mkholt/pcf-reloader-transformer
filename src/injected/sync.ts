import socket from "socket.io-client";

import { reloadComponent } from "./callouts";
import { log } from "./logger";

type SocketIo = {
	on: (eventName: string, callback: (...args: unknown[]) => void) => SocketIo
	onevent: (packet: unknown) => void
	close: () => SocketIo
}

export type ReloadParams = {
    context: ComponentFramework.Context<unknown>
    notifyOutputChanged: () => void
    state: ComponentFramework.Dictionary
    container: HTMLDivElement
}

export interface PcfReloaderWindow extends Window {
    pcfReloadParams: ReloadParams
}

declare const window: PcfReloaderWindow

let _socket: SocketIo|null
let _websocket: WebSocket|null

const hasData = (o: unknown): o is { data: unknown } => !!(o as { data: unknown })?.data
const bsConnect = (baseUrl: string, debug?: boolean) => {
	const socketConfig = {
		"reconnectionAttempts": 50,
		"path": "/browser-sync/socket.io",
	}
	const socketUrl = baseUrl + '/browser-sync'

	_socket = socket(socketUrl, socketConfig) as SocketIo
	_socket.on('disconnect', () => log("BrowserSync disconnected"))
	_socket.on('connect', () => log("BrowserSync connected"))
	_socket.on('browser:reload', () => {
		log("Reload triggered")
		reloadComponent()
	})

	if (debug) {
		const onEvent = _socket.onevent
		_socket.onevent = function(packet: unknown) {
			onEvent.call(this, packet);

			if (hasData(packet))
				log("> " + JSON.stringify(packet.data))
		};
	}

	return socketUrl
}

const wsConnect = (address: string, debug?: boolean) => {
	_websocket = new WebSocket(address)
	_websocket.onmessage = (msg) => {
		if (msg.data !== "reload" && msg.data !== "refreshcss") {
			if (debug) log("> " + JSON.stringify(msg))
			return
		}
		
		log("Reload triggered")
		reloadComponent()
	}

	return address
}

export const doConnect = (baseUrl: string, params: ReloadParams, debug?: boolean) => {
	window.pcfReloadParams = params;

	const address = (baseUrl.indexOf("http") > -1)
		? bsConnect(baseUrl, debug)
		: wsConnect(baseUrl, debug)

	log("Live reload enabled on " + address)	
}

export const doDisconnect = () => {
	if (_socket) {
		_socket.close()
	}

	if (_websocket) {
		_websocket.onmessage = null;
		_websocket.close();
	}
}
