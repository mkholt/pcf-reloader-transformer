import {
	doDisconnect,
	PcfReloaderWindow,
} from "./sync";

declare const window: PcfReloaderWindow

const isScript = (s: HTMLOrSVGScriptElement): s is HTMLScriptElement => !!(s as HTMLScriptElement).src;

export type ComponentType = ComponentFramework.StandardControl<unknown, unknown>

let _currentScript: HTMLOrSVGScriptElement|null
let _instance: ComponentType|undefined
export const onConstruct = <T extends ComponentType>(instance: T, currentScript: HTMLOrSVGScriptElement|null) => {
	_currentScript = currentScript
	_instance = instance
	
	if (!window.pcfReloadParams) return
	
	const params = window.pcfReloadParams;
	instance.init(params.context, params.notifyOutputChanged, params.state, params.container);
	instance.updateView(params.context);
}

export const hasParams = () => !!window.pcfReloadParams

export const onUpdateContext = (context: ComponentFramework.Context<unknown>) => {
	window.pcfReloadParams = {
		...window.pcfReloadParams,
		context: context
	}
}

export const reloadComponent = () => {
	if (!_instance) return

	_instance.destroy()
	doDisconnect()
	if (!_currentScript || !isScript(_currentScript))
		return

	const script = document.createElement("script")
	script.src = _currentScript.src

	const parent = _currentScript.parentNode

	if (!parent) return
	
	_currentScript.remove()

	parent.appendChild(script)
}
