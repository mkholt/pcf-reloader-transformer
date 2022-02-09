const timestamp = () => {
	const d = new Date()
	return d.toLocaleTimeString('en-US', {
		hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
	}) + "." + d.getMilliseconds()
}

export const log = (...message: string[]) => console.log("[pcf-reloader]", "[" + timestamp() + "]", ...message)
