import { ReactElement } from 'react';

import {
  IInputs,
  IOutputs,
} from './generated/ManifestTypes';

export class SampleComponent implements ComponentFramework.ReactControl<IInputs, IOutputs> {
	init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged?: (() => void) | undefined, state?: ComponentFramework.Dictionary | undefined): void {
		throw new Error("Method not implemented.");
	}

	updateView(context: ComponentFramework.Context<IInputs>): ReactElement {
		throw new Error("Method not implemented.");
	}
	
	destroy(): void {
		throw new Error("Method not implemented.");
	}
}
