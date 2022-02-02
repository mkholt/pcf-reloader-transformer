import { PluginConfig } from "ts-patch";

export type IPluginConfig = PluginConfig & {
	printGenerated?: boolean,
	verbose?: boolean,
	wsAddress?: string,
}
