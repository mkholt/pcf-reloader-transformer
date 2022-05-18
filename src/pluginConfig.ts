import { PluginConfig } from 'ts-patch';

export type IPluginConfig = PluginConfig & {
	printGenerated?: boolean
	verbose?: boolean
	wsAddress?: string
	useBrowserSync?: boolean
	showForceReload?: boolean
	debug?: boolean
}
