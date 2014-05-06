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
    UndoButtonContainerView.prototype.validate = function () {
        _super.prototype.validate.call(this);
        var b = View.getCurrentPage().header.undobuttons;
        assert(b.undobutton != null, "Cannot find undo button view");
        assert(b.redobutton != null, "Cannot find redo button view");
        assert($('#' + b.undobutton.id).length === 1, "Cannot find undo button element");
        assert($('#' + b.redobutton.id).length === 1, "Cannot find redo button element");
        assert(((ActionManager.nextUndo() === -1) && ($('#' + b.undobutton.id).children('div.ui-disabled').length === 1)) || ((ActionManager.nextUndo() !== -1) && ($('#' + b.undobutton.id).children('div.ui-disabled').length === 0)), "Undo button does not match nextUndo()");
        assert(((ActionManager.nextRedo() === -1) && ($('#' + b.redobutton.id).children('div.ui-disabled').length === 1)) || ((ActionManager.nextRedo() !== -1) && ($('#' + b.redobutton.id).children('div.ui-disabled').length === 0)), "Redo button does not match nextRedo()");
    };
    return UndoButtonContainerView;
})(ContainerView);
//# sourceMappingURL=UndoButtonContainerView.js.map
