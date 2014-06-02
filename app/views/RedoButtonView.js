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
        this.value = 'theme/images/redo.png';
        this.cssClass = 'redo-button';
    }
    RedoButtonView.prototype.init = function () {
        this.isClickable = true;
    };
    RedoButtonView.prototype.onClick = function (params) {
        if (this.isEnabled) {
            this.start();
        }
        ActionManager.redo();
    };
    RedoButtonView.prototype.layoutDown = function () {
        this.layout = {
            top: 0,
            left: 44,
            width: 36,
            height: 36
        };
    };
    return RedoButtonView;
})(ButtonView);
//# sourceMappingURL=RedoButtonView.js.map
