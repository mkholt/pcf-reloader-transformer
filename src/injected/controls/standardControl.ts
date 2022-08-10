import { Connection } from '../connect/connection';
import {
	error,
	log,
} from '../logger';
import ReloadButton from '../reloadButton';
import Spinner from '../spinner';
import { BaseControl } from './base';

type ControlType<IInputs, IOutputs> = ComponentFramework.StandardControl<IInputs, IOutputs>

export class StandardControl<IInputs, IOutputs> extends BaseControl<ControlType<IInputs, IOutputs>, IInputs> implements ControlType<IInputs, IOutputs> {
	constructor(className: string, connection: Connection, script: HTMLOrSVGScriptElement|null, showForceReload: boolean) {
		super(className, connection, script, showForceReload)
	}

	protected onLoadScript() {
		log(`Replacing wrapped instance of ${this.className}`)
		const wrapped = this.buildWrapped()
		if (!this.params || !wrapped) return;
		log(`Instance replaced, calling init and updateView`)

		// The new instance was initialized, call it with the last known state of the component
		const { context, notifyOutputChanged, state, container } = this.params
		wrapped.init(context, notifyOutputChanged, state, container)
		wrapped.updateView(context)
	}

	protected onScriptError(e: ErrorEvent) {
		error(`An error occurred loading the ${this.className} component:`, e.message)
		if (!this.params || !this.params.container) return;

		const button = document.createElement("button")
		button.textContent = "Try again"
		button.setAttribute("data-testid", "error-button-retry")
		button.addEventListener("click", () => this.reloadComponent())

		const message = document.createElement("span")
		message.textContent = `An error occurred loading the component ${this.className} - see console for details`

		const errorDiv = document.createElement("div")
		errorDiv.setAttribute("data-testid", "error-container")
		errorDiv.append(button, message)
		this.params.container.replaceChildren(errorDiv)
	}

	protected showSpinner(): void {
		this.params?.container?.replaceChildren(Spinner())
	}

	protected wrapContainer(container?: HTMLDivElement): HTMLDivElement|undefined {
		if (container && this.showForceReload) {
			const innerContainer = document.createElement("div")
			innerContainer.setAttribute("data-testid", "component-container")
			container.replaceChildren(innerContainer, ReloadButton(() => this.reloadComponent()))

			return innerContainer
		}

		return this.showForceReload ? undefined : container
	}

	/** Wrapped methods */
	updateView(context: ComponentFramework.Context<IInputs>): void {
		this.params = {
			...this.params,
			context: context
		}
		this.wrapped?.updateView(context)
	}
}
