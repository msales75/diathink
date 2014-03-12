var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ButtonView.js");
var UndoButtonView = (function (_super) {
    __extends(UndoButtonView, _super);
    function UndoButtonView() {
        _super.apply(this, arguments);
        this.cssClass = 'undo-button';
    }
    UndoButtonView.prototype.init = function () {
        this.Class = UndoButtonView;
        this.isClickable = true;
    };
    UndoButtonView.prototype.onClick = function () {
        ActionManager.undo();
    };
    return UndoButtonView;
})(ButtonView);
//# sourceMappingURL=UndoButtonView.js.map
