import { log } from './logger';
import {
	ComponentWrapper,
	doConnect,
	doDisconnect,
} from './sync';

type ReloadParams<IInputs> = {
    context: ComponentFramework.Context<IInputs>
    notifyOutputChanged?: () => void
    state?: ComponentFramework.Dictionary
    container?: HTMLDivElement
}

interface PCFReloaderWindow extends Window {
	pcfConstructors: Record<string, (() => ComponentFramework.StandardControl<unknown, unknown>)|undefined>
}

declare const window: PCFReloaderWindow

const isScript = (s: HTMLOrSVGScriptElement|null): s is HTMLScriptElement => !!(s as HTMLScriptElement)?.src;

/**
 * Call to update the lambda function used to instantiate the PCF component class.
 * 
 * This MUST be called before attempting to rebuild
 * @param className The name of the wrapped PCF component class
 * @param builder The lambda function building the instance½
 */
export const UpdateBuilder = <TBase extends ComponentFramework.StandardControl<unknown, unknown>>(className: string, builder: () => TBase) => {
	log(`Updating builder function for ${className}`)
	window.pcfConstructors = {
		...window.pcfConstructors,
		[className]: builder
	}
}

export class ReloaderClass<TBase extends ComponentFramework.StandardControl<IInputs, IOutputs>, IInputs, IOutputs> implements ComponentFramework.StandardControl<IInputs, IOutputs>, ComponentWrapper {
	private _className: string
	private _wrapped: TBase|undefined
	private _baseUrl: string
	private _remoteUrl: string

	private _params: ReloadParams<IInputs>|undefined

	constructor(className: string, baseUrl: string, script: HTMLOrSVGScriptElement|null) {
		log(`PCF Reloader initialized for ${className}`)
		this._className = className
		this._baseUrl = baseUrl
		this._remoteUrl = isScript(script) ? script.src : ""
		this.buildWrapped()
	}

	private _scriptTag: HTMLScriptElement|undefined
	reloadComponent(): void {
		// If we don't have a remote-url, abort
		if (!this._remoteUrl)
			return

		// Destroy the wrapped component, if initialized
		if (this._wrapped) {
			this._wrapped.destroy()
		}

		if (this._params && this._params.container) {
			const spinner = this.getSpinner()
			this._params.container.replaceChildren(spinner)
		}

		// If _scriptTag is set, we've already reloaded once, remove the tag
		if (this._scriptTag) {
			window.document.body.removeChild(this._scriptTag)
		}

		// Create a new script tag
		this._scriptTag = document.createElement("script")
		this._scriptTag.defer = true

		// Listen for load event so we can initialize
		this._scriptTag.addEventListener("load", () => this.onLoadScript())

		// Set the source
		this._scriptTag.src = this._remoteUrl + "#" + +(new Date())

		// Add the script tag to the document
		window.document.body.appendChild(this._scriptTag)
	}

	private _spinner: HTMLDivElement|undefined
	private getSpinner() {
		if (this._spinner) return this._spinner

		const spinner = document.createElement("div")
		spinner.style.boxSizing = "border-box"
		spinner.style.borderRadius = "50%"
		spinner.style.borderWidth = "1.5px"
		spinner.style.borderStyle = "solid"
		spinner.style.borderColor = "rgb(0, 120, 212) rgb(199, 224, 244) rgb(199, 224, 244)"
		spinner.style.borderImage = "initial"
		spinner.style.animationName = "reloader-spinner"
		spinner.style.animationDuration = "1.3s"
		spinner.style.animationIterationCount = "infinite"
		spinner.style.animationTimingFunction = "cubic-bezier(0.53, 0.21, 0.29, 0.67)"
		spinner.style.width = "16px"
		spinner.style.height = "16px"

		const keyframes = document.createElement("style")
		keyframes.innerHTML = `
			@keyframes reloader-spinner {
				0% {
					transform: rotate(0deg);
				}
				100% {
					transform: rotate(360deg);
				}
			}
		`
		spinner.appendChild(keyframes)

		const reloading = document.createElement("div")
		reloading.style.display = "flex"
		reloading.style.gap = "6px"
		reloading.textContent = "Reloading..."
		reloading.appendChild(spinner)

		this._spinner = reloading
		return reloading
	}

	private onLoadScript() {
		log(`Replacing wrapped instance of ${this._className}`)
		this.buildWrapped()
		if (!this._params || !this._wrapped) return;

		// The new instance was initialized, call it with the last known state of the component
		const { context, notifyOutputChanged, state, container } = this._params
		this._wrapped.init(context, notifyOutputChanged, state, container)
		this._wrapped.updateView(context)
	}

	/**
	 * Build and update the wrapped instance
	 */
	private buildWrapped() {
		const className = this._className
		const constructors = window.pcfConstructors || {}
		const builder = constructors[className]
		this._wrapped = builder?.call(this) as TBase
	}

	/** Wrapped methods */
	init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged?: () => void, state?: ComponentFramework.Dictionary, container?: HTMLDivElement): void {
		this._params = {
			context: context,
			notifyOutputChanged: notifyOutputChanged,
			state: state,
			container: container
		};

		doConnect(this, this._baseUrl);

		this._wrapped?.init(context, notifyOutputChanged, state, container)
	}

	updateView(context: ComponentFramework.Context<IInputs>): void {
		this._params = {
			...this._params,
			context: context
		}
		this._wrapped?.updateView(context)
	}

	destroy(): void {
		// Disconnect from the socket
		doDisconnect()


		// Clean up the parameters
		this._params = undefined

		// Clean up the wrapped instance
		this._wrapped?.destroy()
	}
}
