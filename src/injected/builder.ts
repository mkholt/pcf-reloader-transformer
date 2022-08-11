import { WrappedControl } from './controls/base';
import { log } from './logger';

interface PCFReloaderWindow<ControlType extends WrappedControl> extends Window {
	pcfConstructors: Record<string, (() => ControlType)|undefined>
}

const getWindow = <ControlType extends WrappedControl>() => window as unknown as PCFReloaderWindow<ControlType>

/**
 * Call to update the lambda function used to instantiate the PCF component class.
 * 
 * This MUST be called before attempting to rebuild
 * @param className The name of the wrapped PCF component class
 * @param builder The lambda function building the instance½
 */
export function UpdateBuilder<ControlType extends WrappedControl>(className: string, builder: () => ControlType) {
	log(`Updating builder function for ${className}`)
	const w = getWindow<ControlType>()
	w.pcfConstructors = {
		...w.pcfConstructors,
		[className]: builder
	}
}

export function GetBuilder<ControlType extends WrappedControl>(className: string) {
	const constructors = getWindow<ControlType>().pcfConstructors || {}
	return constructors[className]
}
