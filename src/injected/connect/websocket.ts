import {
	Connection,
	Handler,
} from './connection';

export class WebSocketConnection extends Connection {
	constructor(baseUrl: string) {
		super(baseUrl);
	}

	protected ConnectInner(onReload: () => void): Handler {
		const socket = new WebSocket(this.baseUrl)
		socket.onmessage = (msg: MessageEvent<string>) => {
			if (["reload","refreshcss"].indexOf(msg.data) > -1)
				onReload()
		}

		return {
			address: this.baseUrl,
			onClose: () => {
				socket.onmessage = null
				socket.close()
			}
		}
	}
}
