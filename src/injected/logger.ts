const timestamp = () => new Date().toLocaleTimeString([], {
	hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3
} as Intl.DateTimeFormatOptions)

export const log = (...message: string[]) => console.log("[pcf-reloader]", "[" + timestamp() + "]", ...message)
