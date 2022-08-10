import { GetBuilder } from '../builder';
import {
	ComponentWrapper,
	Connection,
} from '../connect/connection';
import { log } from '../logger';

type ReloadParams<IInputs> = {
    context: ComponentFramework.Context<IInputs>
    notifyOutputChanged?: () => void
    state?: ComponentFramework.Dictionary
    container?: HTMLDivElement
}

const isScript = (s: HTMLOrSVGScriptElement|null): s is HTMLScriptElement => !!(s as HTMLScriptElement)?.src;

export type WrappedControl = ComponentFramework.ReactControl<unknown, unknown>|ComponentFramework.StandardControl<unknown, unknown>

export abstract class BaseControl<ControlType extends WrappedControl, IInputs> implements ComponentWrapper {
	private _connection: Connection
	private _remoteUrl: string

	protected className: string
	protected wrapped: ControlType|undefined
	protected showForceReload: boolean
	protected params: ReloadParams<IInputs>|undefined

	constructor(className: string, connection: Connection, script: HTMLOrSVGScriptElement|null, showForceReload: boolean) {
		log(`PCF Reloader initialized for ${className}`)
		this.className = className
		this._connection = connection
		this._remoteUrl = isScript(script) ? script.src : ""
		this.showForceReload = showForceReload
		this.buildWrapped()
	}

	private _scriptTag: HTMLScriptElement|undefined
	reloadComponent(): void {
		// If we don't have a remote-url, abort
		if (!this._remoteUrl)
			return

		// Destroy the wrapped component, if initialized
		if (this.wrapped) {
			this.wrapped.destroy()
		}

		// Call the implementing class to show a suiting spinner
		this.showSpinner()

		// If _scriptTag is set, we've already reloaded once, remove the tag
		if (this._scriptTag) {
			window.document.body.removeChild(this._scriptTag)
		}

		// Create a new script tag
		this._scriptTag = document.createElement("script")
		this._scriptTag.setAttribute("data-testid", "reloader-script")
		this._scriptTag.defer = true

		// Listen for load event so we can initialize
		this._scriptTag.addEventListener("load", () => this.onLoadScript())
		this._scriptTag.addEventListener("error", (e) => this.onScriptError(e))

		// Set the source
		this._scriptTag.src = this._remoteUrl + "#" + +(new Date())

		// Add the script tag to the document
		window.document.body.appendChild(this._scriptTag)
	}

	/**
	 * Build and update the wrapped instance
	 */
	protected buildWrapped() {
		const builder = GetBuilder<ControlType>(this.className)
		this.wrapped = builder?.call(this)

		return this.wrapped
	}

	protected abstract onLoadScript(): void
	protected abstract onScriptError(e: ErrorEvent): void
	protected abstract showSpinner(): void
	protected abstract wrapContainer(container?: HTMLDivElement): HTMLDivElement|undefined

	/** Wrapped methods */
	init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged?: () => void, state?: ComponentFramework.Dictionary, container?: HTMLDivElement): void {
		const innerContainer = this.wrapContainer(container)

		this.params = {
			context: context,
			notifyOutputChanged: notifyOutputChanged,
			state: state,
			container: innerContainer
		};

		this._connection.Connect(this);

		this.wrapped?.init(context, notifyOutputChanged, state, innerContainer)
	}

	destroy(): void {
		// Disconnect from the socket
		this._connection.Disconnect();

		// Clean up the parameters
		this.params = undefined

		// Clean up the wrapped instance
		this.wrapped?.destroy()
	}
}
