/* eslint-disable @typescript-eslint/no-unused-vars */
export class ReloaderClass<IInputs, IOutputs> implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	init(_context: ComponentFramework.Context<unknown>, _notifyOutputChanged?: () => void, _state?: ComponentFramework.Dictionary, _container?: HTMLDivElement): void {
		throw new Error("Method not implemented.");
	}

	updateView(_context: ComponentFramework.Context<unknown>): void {
		throw new Error("Method not implemented.");
	}

	destroy(): void {
		throw new Error("Method not implemented.");
	}
}
