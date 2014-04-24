///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

class UndoButtonContainerView extends ContainerView {
    anchorLocation:any = M.RIGHT; // for placement within toolbar (todo: phase this out)
    cssClass = 'undo-container';
    undobutton:UndoButtonView;
    redobutton:RedoButtonView;

    init() {
        this.Class = UndoButtonContainerView;
        this.childViewTypes = {
            undobutton: UndoButtonView,
            redobutton: RedoButtonView
        };
    }
    validate() {
        super.validate();
        var b = View.getCurrentPage().header.undobuttons;
        assert(b.undobutton != null,
            "Cannot find undo button view");
        assert(b.redobutton != null,
            "Cannot find redo button view");
        assert($('#' + b.undobutton.id).length === 1,
            "Cannot find undo button element");
        assert($('#' + b.redobutton.id).length === 1,
            "Cannot find redo button element");
        assert(
            ((ActionManager.nextUndo() === -1) &&
                ($('#' + b.undobutton.id).children('div.ui-disabled').length === 1)) ||
                ((ActionManager.nextUndo() !== -1) &&
                    ($('#' + b.undobutton.id).children('div.ui-disabled').length === 0)),
            "Undo button does not match nextUndo()");
        assert(
            ((ActionManager.nextRedo() === -1) &&
                ($('#' + b.redobutton.id).children('div.ui-disabled').length === 1)) ||
                ((ActionManager.nextRedo() !== -1) &&
                    ($('#' + b.redobutton.id).children('div.ui-disabled').length === 0)),
            "Redo button does not match nextRedo()");
    }
}
