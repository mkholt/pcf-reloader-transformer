import socket from 'socket.io-client';

import { log } from './logger';

type SocketIo = {
	on: (eventName: string, callback: (...args: unknown[]) => void) => SocketIo
	onevent: (packet: { data?: unknown }) => void
	close: () => SocketIo
}

let _socket: SocketIo|WebSocket|undefined

const bsConnect = (baseUrl: string, onReload: () => void, debug?: boolean) => {
	const socketConfig = {
		"reconnectionAttempts": 50,
		"path": "/browser-sync/socket.io",
	}
	const socketUrl = baseUrl + '/browser-sync'

	_socket = socket(socketUrl, socketConfig) as SocketIo
	_socket.on('disconnect', () => log("BrowserSync disconnected"))
	_socket.on('connect', () => log("BrowserSync connected"))
	_socket.on('browser:reload', onReload)

	if (debug) {
		const onEvent = _socket.onevent
		_socket.onevent = function(packet) {
			onEvent.call(this, packet);

			log("> " + JSON.stringify(packet.data))
		};
	}

	return socketUrl
}

const wsConnect = (address: string, onReload: () => void, debug?: boolean) => {
	_socket = new WebSocket(address)
	_socket.onmessage = (msg: MessageEvent<string>) => {
		if (msg.data !== "reload" && msg.data !== "refreshcss") {
			if (debug) {
				log("> " + msg.data)
			}
			return
		}

		onReload()
	}

	return address
}

export interface ComponentWrapper {
	reloadComponent(): void
}

/**
 * Connect to the appropriate endpoint as given by the baseUrl.
 * 
 * If the URL starts with http, use Browser-Sync (Socket.IO),
 * otherwise use classic WebSockets
 * 
 * @param reloader The wrapper class to notify about reload
 * @param baseUrl The URL to connect to
 * @param debug If `true` any unknown message is written to console
 */
export const doConnect = (reloader: ComponentWrapper, baseUrl: string, debug?: boolean) => {
	const onReload = () => {
		log("Reload triggered")
		reloader.reloadComponent()
	}

	const address = (baseUrl.indexOf("http") > -1)
		? bsConnect(baseUrl, onReload, debug)
		: wsConnect(baseUrl, onReload, debug)

	log(`Live reload enabled on ${address}`)	
}

const isWebSocket = (s: WebSocket|SocketIo): s is WebSocket => !!(s as WebSocket)?.onmessage

/**
 * Disconnect from any connected socket
 */
export const doDisconnect = () => {
	if (_socket) {
		if (isWebSocket(_socket)) _socket.onmessage = null
		_socket.close()
		_socket = undefined
	}

	log("Live reload disabled")
}
