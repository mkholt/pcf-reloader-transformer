import SocketIo from 'socket.io-client';

import { log } from '../logger';
import {
	Connection,
	Handler,
} from './connection';

type SocketIo = {
	on: (eventName: string, callback: (...args: unknown[]) => void) => SocketIo
	close: () => SocketIo
}

export class SocketIOConnection extends Connection {
	constructor(baseUrl: string) {
		super(baseUrl);
	}

	ConnectInner(onReload: () => void): Handler {
		const socketUrl = this.baseUrl + '/browser-sync'
		const opts = {
			reconnectionAttempts: 50,
			path: "/browser-sync/socket.io"
		}

		const socket = SocketIo(socketUrl, opts)
		
		socket.on('disconnect', () => log("BrowserSync disconnected"))
		socket.on('connect', () => log("BrowserSync connected"))
		socket.on('browser:reload', onReload)

		return {
			address: socketUrl,
			onClose: () => socket.close()
		}
	}
}