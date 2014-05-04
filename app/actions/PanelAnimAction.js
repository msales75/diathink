///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/actions/AnimatedAction.js");

var PanelAnimAction = (function (_super) {
    __extends(PanelAnimAction, _super);
    function PanelAnimAction() {
        _super.apply(this, arguments);
    }
    PanelAnimAction.prototype.panelPrep = function () {
        return;
    };
    return PanelAnimAction;
})(AnimatedAction);
//# sourceMappingURL=PanelAnimAction.js.map
