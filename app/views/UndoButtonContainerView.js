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
        this.childViewTypes = {
            undobutton: UndoButtonView,
            redobutton: RedoButtonView
        };
    };
    UndoButtonContainerView.prototype.layoutDown = function () {
        var p = this.parentView.layout;
        this.layout = {
            top: 4,
            left: p.width - 100 - 5,
            width: 100,
            height: 36
        };
    };
    UndoButtonContainerView.prototype.validate = function () {
        _super.prototype.validate.call(this);
        var b = View.getCurrentPage().header.undobuttons;
        assert(b.undobutton != null, "Cannot find undo button view");
        assert(b.redobutton != null, "Cannot find redo button view");
        assert($('#' + b.undobutton.id).length === 1, "Cannot find undo button element");
        assert($('#' + b.redobutton.id).length === 1, "Cannot find redo button element");
        assert((ActionManager.nextUndo() !== -1) === (b.undobutton.isEnabled), "Undo button does not match nextUndo()");
        assert((ActionManager.nextRedo() !== -1) === (b.redobutton.isEnabled), "Redo button does not match nextUndo()");
    };
    return UndoButtonContainerView;
})(ContainerView);
//# sourceMappingURL=UndoButtonContainerView.js.map
