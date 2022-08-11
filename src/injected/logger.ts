const timestamp = () => {
	const d = new Date()
	return d.toLocaleTimeString('en-US', {
		hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
	})
}

const prefix = () => ["[" + timestamp() + "]", "[pcf-reloader]"]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const log = (...args: any) => console.log(...prefix(), ...args)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const error = (...args: any) => console.error(...prefix(), ...args)
