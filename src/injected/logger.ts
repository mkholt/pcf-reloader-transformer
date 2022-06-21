const timestamp = () => {
	const d = new Date()
	return d.toLocaleTimeString('en-US', {
		hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
	})
}

const prefix = () => ["[" + timestamp() + "]", "[pcf-reloader]"]

export const log = console.log.bind(console, ...prefix())
export const error = console.error.bind(console, ...prefix())
