"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SampleComponent = void 0;
var _pcfReloadLib = require("pcf-reloader-transformer/dist/injected");
var _pcfReloadControl = require("pcf-reloader-transformer/dist/injected/controls");
var _pcfReloadCurrentScript = document.currentScript;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var SampleComponent_reloaded_HASH = /** @class */ (function () {
    /**
     * Empty constructor.
     */
    function SampleComponent_reloaded_HASH() {
    }
    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    SampleComponent_reloaded_HASH.prototype.init = function (context, notifyOutputChanged, state, container) {
        this._container = container;
    };
    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    SampleComponent_reloaded_HASH.prototype.updateView = function (context) {
        this._container.innerHTML = "<div>Hello, world!</div>";
    };
    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    SampleComponent_reloaded_HASH.prototype.getOutputs = function () {
        return {};
    };
    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    SampleComponent_reloaded_HASH.prototype.destroy = function () {
    };
    return SampleComponent_reloaded_HASH;
}());
var SampleComponent = /** @class */ (function (_super) {
    __extends(SampleComponent, _super);
    function SampleComponent() {
        return _super.call(this, "SampleComponent", "http://localhost:8181", _pcfReloadCurrentScript, true) || this;
    }
    return SampleComponent;
}(_pcfReloadControl.StandardControl));
exports.SampleComponent = SampleComponent;
_pcfReloadLib.UpdateBuilder("SampleComponent", function () { _pcfReloadLib.log("Builder called for:", "SampleComponent_reloaded_HASH"); return new SampleComponent_reloaded_HASH; })
