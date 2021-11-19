import { IInputs, IOutputs } from "./generated/ManifestTypes";
type PcfReloadParams = {
    context: ComponentFramework.Context<IInputs>;
    notifyOutputChanged: () => void;
    state: ComponentFramework.Dictionary;
    container: HTMLDivElement;
};
interface PcfWindow extends Window {
    pcfReloadParams: PcfReloadParams;
}
declare let window: PcfWindow;
const currentScript = document.currentScript;
export class SampleComponent implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    /**
     * Empty constructor.
     */
    constructor() {
        if (window.pcfReloadParams) {
            const params = window.pcfReloadParams;
            this.init(params.context, params.notifyOutputChanged, params.state, params.container);
            this.updateView(params.context);
        }
    }
    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this.listenToWSUpdates({
            context: context,
            notifyOutputChanged: notifyOutputChanged,
            state: state,
            container: container
        });
        this._container = container;
    }
    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        if (window.pcfReloadParams)
            window.pcfReloadParams.context = context;
        this._container.innerHTML = "<div>Hello, world!</div>";
    }
    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        return {};
    }
    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
    }
    private _reloadSocket: WebSocket | undefined;
    private listenToWSUpdates(params: PcfReloadParams) {
        window.pcfReloadParams = params;
        const address = "ws://127.0.0.1:8181/ws";
        this._reloadSocket = new WebSocket(address);
        this._reloadSocket.onmessage = msg => {
            if (msg.data != "reload" && msg.data != "refreshcss")
                return;
            this.reloadComponent();
        };
        console.log("Live reload enabled on " + address);
    }
    private reloadComponent() {
        console.log("Reload triggered");
        this.destroy();
        this._reloadSocket.onmessage = null;
        this._reloadSocket.close();
        const isScript = (s: HTMLOrSVGScriptElement): s is HTMLScriptElement => !!(s as HTMLScriptElement).src;
        if (!currentScript || !isScript(currentScript))
            return;
        const script = document.createElement("script");
        script.src = currentScript.src;
        const parent = currentScript.parentNode;
        if (!parent)
            return;
        currentScript.remove();
        parent.appendChild(script);
    }
}
if (window.pcfReloadParams)
    new SampleComponent();
