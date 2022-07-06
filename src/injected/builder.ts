import {
	PCFReloaderWindow,
	WrappedControl,
} from './controls/base';
import { log } from './logger';

/**
 * Call to update the lambda function used to instantiate the PCF component class.
 * 
 * This MUST be called before attempting to rebuild
 * @param className The name of the wrapped PCF component class
 * @param builder The lambda function building the instance½
 */
export const UpdateBuilder = <ControlType extends WrappedControl>(className: string, builder: () => ControlType) => {
	log(`Updating builder function for ${className}`)
	const w = window as unknown as PCFReloaderWindow<ControlType>
	w.pcfConstructors = {
		...w.pcfConstructors,
		[className]: builder
	}
}