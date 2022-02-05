import {
	disconnect,
	PcfReloaderWindow,
} from "./sync";

declare const window: PcfReloaderWindow

const isScript = (s: HTMLOrSVGScriptElement): s is HTMLScriptElement => !!(s as HTMLScriptElement).src;

export type ComponentType = ComponentFramework.StandardControl<unknown, unknown>

let _currentScript: HTMLOrSVGScriptElement|null
export const constructor = <T extends ComponentType>(instance: T, currentScript: HTMLOrSVGScriptElement|null) => {
	_currentScript = currentScript
	
	if (!window.pcfReloadParams) return
	
	const params = window.pcfReloadParams;
	instance.init(params.context, params.notifyOutputChanged, params.state, params.container);
	instance.updateView(params.context);
}

export const reloadComponent = <T extends ComponentFramework.StandardControl<unknown, unknown>>(self: T) => {
	self.destroy();
	disconnect();
	if (!_currentScript || !isScript(_currentScript))
		return;

	const script = document.createElement("script");
	script.src = _currentScript.src;

	const parent = _currentScript.parentNode;

	if (!parent) return
	
	_currentScript.remove();

	parent.appendChild(script);
}

export const hasParams = () => !!window.pcfReloadParams

export const updateContext = (context: ComponentFramework.Context<unknown>) => {
	window.pcfReloadParams = {
		...window.pcfReloadParams,
		context: context
	}
}
