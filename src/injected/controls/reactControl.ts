import React from 'react';

import ComponentWrapper from '../components/componentWrapper';
import { BaseControl } from './base';

type ComponentType<IInputs, IOutputs> = ComponentFramework.ReactControl<IInputs, IOutputs>

export class ReactControl<IInputs, IOutputs> extends BaseControl<ComponentType<IInputs, IOutputs>, IInputs> implements ComponentType<IInputs, IOutputs> {
	constructor(className: string, baseUrl: string, script: HTMLOrSVGScriptElement|null, showForceReload: boolean) {
		super(className, baseUrl, script, showForceReload)
	}

	updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
		this.params = {
			...this.params,
			context: context
		}

		const component = this.wrapped?.updateView(context)
		return React.createElement(ComponentWrapper, { component })
	}

	protected onLoadScript(): void {
		throw new Error("Method not implemented.");
	}

	protected onScriptError(): void {
		throw new Error("Method not implemented.");
	}

	protected wrapContainer(): undefined {
		return undefined
	}
}