import { log } from '../logger';

export interface Handler {
	address: string
	onClose: () => void
}

export interface ComponentWrapper {
	reloadComponent(): void
}

export abstract class Connection {
	protected baseUrl: string
	private _component: ComponentWrapper
	private _handler: Handler | undefined

	constructor(component: ComponentWrapper, baseUrl: string) {
		this._component = component
		this.baseUrl = baseUrl
	}

	/**
	 * Connect to the appropriate endpoint as given by the baseUrl.
	 * 
	 * If the URL starts with http, use Browser-Sync (Socket.IO),
	 * otherwise use classic WebSockets
	 */
	Connect(): void {
		const onReload = () => {
			log("Reload triggered")
			this._component.reloadComponent()
		}

		this._handler = this.ConnectInner(onReload)

		log(`Live reload enabled on ${this._handler.address}`)
	}

	/**
	 * Disconnect from any connected socket
	 */
	Disconnect(): void {
		if (this._handler) this._handler.onClose()
		log("Live reload disabled")
	}

	protected abstract ConnectInner(onReload: () => void): Handler
}