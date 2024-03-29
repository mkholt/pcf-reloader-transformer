import React from 'react';

import { Connection } from '../connect/connection';
import {
	error,
	log,
} from '../logger';
import ComponentWrapper, {
	ComponentMode,
	ComponentWrapperProps,
	ComponentWrapperState,
} from '../react/componentWrapper';
import { BaseControl } from './base';

type ComponentType<IInputs, IOutputs> = ComponentFramework.ReactControl<IInputs, IOutputs>

export class ReactControl<IInputs, IOutputs> extends BaseControl<ComponentType<IInputs, IOutputs>, IInputs> implements ComponentType<IInputs, IOutputs> {
	private _componentRef: ComponentWrapper|null = null

	constructor(className: string, connection: Connection, script: HTMLOrSVGScriptElement|null, showForceReload: boolean) {
		super(className, connection, script, showForceReload)
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
		this.setState({
			component: component,
			mode: ComponentMode.Component
		})
	}

	protected onScriptError(e: ErrorEvent): void {
		error(`An error occurred loading the ${this.className} component:`, e.message)

		this.setState({
			mode: ComponentMode.Error
		})
	}

	protected wrapContainer(): undefined {
		return undefined
	}

	protected showSpinner(): void {
		// Tell the wrapper to show the spinner
		this.setState({
			mode: ComponentMode.Spinner
		})
	}

	protected setState(state: ComponentWrapperState) {
		this._componentRef?.setState(state)
	}
}