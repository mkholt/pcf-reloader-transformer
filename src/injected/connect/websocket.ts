import {
	Connection,
	Handler,
} from './connection';

export class WebSocketConnection extends Connection {
	constructor(baseUrl: string) {
		super(baseUrl);
	}

	ConnectInner(onReload: () => void): Handler {
		const socket = new WebSocket(this.baseUrl)
		socket.onmessage = (msg: MessageEvent<string>) => {
			if (msg.data !== "reload" && msg.data !== "refreshcss") {
				return
			}

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
