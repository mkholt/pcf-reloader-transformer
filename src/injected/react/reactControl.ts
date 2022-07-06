import React from 'react';

import { BaseControl } from '../controls/base';
import {
	error,
	log,
} from '../logger';
import ComponentWrapper, {
	ComponentMode,
	ComponentWrapperProps,
} from './components/componentWrapper';

type ComponentType<IInputs, IOutputs> = ComponentFramework.ReactControl<IInputs, IOutputs>

export class ReactControl<IInputs, IOutputs> extends BaseControl<ComponentType<IInputs, IOutputs>, IInputs> implements ComponentType<IInputs, IOutputs> {
	private _componentRef: ComponentWrapper|null = null

	constructor(className: string, baseUrl: string, script: HTMLOrSVGScriptElement|null, showForceReload: boolean) {
		super(className, baseUrl, script, showForceReload)
	}

	updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
		this.params = {
			...this.params,
			context: context
		}

		const component = this.wrapped?.updateView(context)
		const props: ComponentWrapperProps = {
			componentName: this.className,
			component: component,
			showForceReload: this.showForceReload,
			onReload: () => this.reloadComponent()
		}
		return React.createElement(ComponentWrapper, {
			...props,
			ref: c => this._componentRef = c
		})
	}

	protected onLoadScript(): void {
		log(`Replacing wrapped instance of ${this.className}`)

		const wrapped = this.buildWrapped()
		if (!this.params || !wrapped) return;
		log(`Got new instance of component, initializing and building component`)

		// The new instance was initialized, call it with the last known state of the component
		const { context, notifyOutputChanged, state, container } = this.params
		wrapped.init(context, notifyOutputChanged, state, container)
		const component = wrapped.updateView(context)

		// Set the state of the wrapper component to update the component and disable the spinner
		this._componentRef?.setState({
			component: component,
			mode: ComponentMode.Component
		})
	}

	protected onScriptError(e: ErrorEvent): void {
		error(`An error occurred loading the ${this.className} component:`, e.message)

		this._componentRef?.setState({
			mode: ComponentMode.Error
		})		
	}

	protected wrapContainer(): undefined {
		return undefined
	}

	protected showSpinner(): void {
		// Tell the wrapper to show the spinner
		this._componentRef?.setState({
			mode: ComponentMode.Spinner
		})
	}
}