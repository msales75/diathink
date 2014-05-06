var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ButtonView.js");
var RedoButtonView = (function (_super) {
    __extends(RedoButtonView, _super);
    function RedoButtonView() {
        _super.apply(this, arguments);
        this.cssClass = 'redo-button';
    }
    RedoButtonView.prototype.init = function () {
        this.isClickable = true;
    };
    RedoButtonView.prototype.onClick = function () {
        ActionManager.redo();
    };
    return RedoButtonView;
})(ButtonView);
//# sourceMappingURL=RedoButtonView.js.map
