import { PluginConfig } from 'ts-patch';

export type IPluginConfig = PluginConfig & {
	/** If `true`, the generated typescript code will be output to a file alongside the detected file.
	 * 
	 * If the file is named `index.ts`, the generated file will be `index.generated.ts`
	 * @default false
	 */
	printGenerated?: boolean

	/** If `true`, status messages will be printed during the transformation
	 * @default false
	*/
	verbose?: boolean

	/** The address to use when listening for update messages.
	 * @default Websocket: `ws://127.0.0.1:8181/ws`, BrowserSync: `http://localhost:8181`
	*/
	wsAddress?: string

	/** If `true` force use of the BrowserSync.io / Socket.io based integration.
	 * 
	 * If `false`, force use of the WebSocket.
	 * 
	 * If not specified, detect the protocol based on the [PCF Start](https://www.npmjs.com/package/pcf-start) version
	 * @default true when PCF Start version >= 1.11.3, false otherwise
	 */
	useBrowserSync?: boolean

	/** If `true` show a reload button in the corner of the component
	 * @default true
	*/
	showForceReload?: boolean

	/** If `true`, inject calls to the debugger to allow stepping into the dynamically loaded code.
	 * @default false
	*/
	debug?: boolean
}
