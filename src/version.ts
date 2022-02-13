import * as pkg from "pcf-start/package.json";

export type Protocol = 'WebSocket' | 'BrowserSync'
export const getProtocol = (): Protocol => {
	const version = pkg.version
	if (!version) return 'WebSocket'
	const [major,minor,build]  = version.split(".")
	if (parseInt(major) < 1) return 'WebSocket'
	if (parseInt(minor) < 11) return 'WebSocket'
	if (parseInt(build) < 3) return 'WebSocket'
	return 'BrowserSync'
}
