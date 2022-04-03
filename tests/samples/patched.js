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
exports.TransformerDemo = void 0;
/* eslint-disable @typescript-eslint/no-empty-function */
var _pcfReloadLib = require("pcf-reloader-transformer/dist/injected");
var _pcfReloadCurrentScript = document.currentScript;
var TransformerDemo_reloaded = /** @class */ (function () {
    /**
     * Empty constructor.
     */
    function TransformerDemo_reloaded() {
    }
    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    TransformerDemo_reloaded.prototype.init = function (context, notifyOutputChanged, state, container) {
        // Add control initialization code
        this._context = context;
        this._container = container;
    };
    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    TransformerDemo_reloaded.prototype.updateView = function (context) {
        var _a;
        this._context = context;
        // Add code to update control view
        var param = (_a = context.parameters.stringProp.raw) !== null && _a !== void 0 ? _a : "World";
        var element = document.createElement("div");
        element.innerText = "Hello, ".concat(param, "!");
        this._container.replaceChildren(element);
    };
    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    TransformerDemo_reloaded.prototype.getOutputs = function () {
        return {};
    };
    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    TransformerDemo_reloaded.prototype.destroy = function () {
        // Add code to cleanup control if necessary
        this._container.innerHTML = '';
    };
    return TransformerDemo_reloaded;
}());
var TransformerDemo = /** @class */ (function (_super) {
    __extends(TransformerDemo, _super);
    function TransformerDemo() {
        return _super.call(this, "TransformerDemo", "http://localhost:8181", _pcfReloadCurrentScript) || this;
    }
    return TransformerDemo;
}(_pcfReloadLib.ReloaderClass));
exports.TransformerDemo = TransformerDemo;
_pcfReloadLib.SetBuilder("TransformerDemo", function () { return new TransformerDemo_reloaded; });
