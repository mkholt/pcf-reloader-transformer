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
var _pcfReloadControl = require("pcf-reloader-transformer/dist/injected/controls/reactControl");
var _pcfReloadConnection = require("pcf-reloader-transformer/dist/injected/connect/socketio");
var _pcfReloadCurrentScript = document.currentScript;
var SampleComponent_reloaded_HASH = /** @class */ (function () {
    function SampleComponent_reloaded_HASH() {
    }
    SampleComponent_reloaded_HASH.prototype.init = function (context, notifyOutputChanged, state) {
        throw new Error("Method not implemented.");
    };
    SampleComponent_reloaded_HASH.prototype.updateView = function (context) {
        throw new Error("Method not implemented.");
    };
    SampleComponent_reloaded_HASH.prototype.destroy = function () {
        throw new Error("Method not implemented.");
    };
    return SampleComponent_reloaded_HASH;
}());
var SampleComponent = /** @class */ (function (_super) {
    __extends(SampleComponent, _super);
    function SampleComponent() {
        var _this = this;
        var connection = new _pcfReloadConnection.SocketIOConnection("http://localhost:8181");
        _this = _super.call(this, "SampleComponent", connection, _pcfReloadCurrentScript, true) || this;
        return _this;
    }
    return SampleComponent;
}(_pcfReloadControl.ReactControl));
exports.SampleComponent = SampleComponent;
_pcfReloadLib.UpdateBuilder("SampleComponent", function () { _pcfReloadLib.log("Builder called for:", "SampleComponent_reloaded_HASH"); return new SampleComponent_reloaded_HASH; })
