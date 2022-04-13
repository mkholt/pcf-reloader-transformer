import * as pkg from 'pcf-start/package.json';

import { log } from './injected/logger';
import { IPluginConfig } from './pluginConfig';

export type Protocol = 'WebSocket' | 'BrowserSync'
export const getProtocol = (opts: IPluginConfig): Protocol => {
	if (opts.useBrowserSync) return 'BrowserSync'
	if (opts.useBrowserSync === false) return 'WebSocket'

	const version = pkg.version
	if (opts.verbose) {
		if (version)
			log("Detected PCF Start version", version)
		else
			log("Could not detect PCF Start version")
	}

	if (!version) return 'WebSocket'

	return version.localeCompare("1.11.3", undefined, { numeric: true }) >= 0
		? 'BrowserSync'
		: 'WebSocket'
}

export const defaultAddress = (protocol: Protocol) => protocol == "BrowserSync"
	? "http://localhost:8181"
	: "ws://127.0.0.1:8181/ws"
