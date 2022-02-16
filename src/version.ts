import * as pkg from "pcf-start/package.json";

import { log } from "./injected/logger";
import { IPluginConfig } from "./pluginConfig";

export type Protocol = 'WebSocket' | 'BrowserSync'
export const getProtocol = (opts: IPluginConfig): Protocol => {
	const version = pkg.version
	if (opts.verbose) {
		log("Detected PCF Start version", version)
	}

	if (!version) return 'WebSocket'
	
	const [major,minor,build] = version.split(".")

	if (parseInt(major) < 1) return 'WebSocket'
	if (parseInt(minor) < 11) return 'WebSocket'
	if (parseInt(build) < 3) return 'WebSocket'
	return 'BrowserSync'
}
