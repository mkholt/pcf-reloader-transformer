import {
	doDisconnect,
	PcfReloaderWindow,
} from "./sync";

declare const window: PcfReloaderWindow

const isScript = (s: HTMLOrSVGScriptElement): s is HTMLScriptElement => !!(s as HTMLScriptElement).src;
export const hasParams = () => !!window.pcfReloadParams

export type ComponentType = ComponentFramework.StandardControl<unknown, unknown>

let _currentScript: HTMLOrSVGScriptElement|null
let _instance: ComponentType|undefined
export const onConstruct = <T extends ComponentType>(instance: T, currentScript: HTMLOrSVGScriptElement|null) => {
	_currentScript = currentScript
	_instance = instance
	
	if (!hasParams()) return
	
	const params = window.pcfReloadParams;
	instance.init(params.context, params.notifyOutputChanged, params.state, params.container);
	instance.updateView(params.context);
}

export const onUpdateContext = (context: ComponentFramework.Context<unknown>) => {
	window.pcfReloadParams = {
		...window.pcfReloadParams,
		context: context
	}
}

export const reloadComponent = () => {
	// A reload always results in a disconnect,
	// if we are not in a valid state, there is no way to recover
	doDisconnect()

	// If we don't have an instance, abort
	if (!_instance) return

	// If we don't have a currentScript, or it's not a script tag, abort
	if (!_currentScript || !isScript(_currentScript))
		return

	// If the script doesn't have a parent, abort
	const parent = _currentScript.parentNode
	if (!parent) return
	
	// We are in a valid state, destroy and rebuild
	_instance.destroy()

	const script = document.createElement("script")
	script.src = _currentScript.src
	
	_currentScript.remove()

	parent.appendChild(script)
}
