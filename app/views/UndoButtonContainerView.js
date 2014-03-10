var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

var UndoButtonContainerView = (function (_super) {
    __extends(UndoButtonContainerView, _super);
    function UndoButtonContainerView() {
        _super.apply(this, arguments);
        this.anchorLocation = M.RIGHT;
        this.cssClass = 'undo-container';
    }
    UndoButtonContainerView.prototype.init = function () {
        this.Class = UndoButtonContainerView;
        this.childViewTypes = {
            undobutton: UndoButtonView,
            redobutton: RedoButtonView
        };
    };
    return UndoButtonContainerView;
})(ContainerView);
//# sourceMappingURL=UndoButtonContainerView.js.map
