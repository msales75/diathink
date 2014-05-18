///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

class UndoButtonContainerView extends ContainerView {
    parentView:HeaderToolbarView;
    anchorLocation:any = M.RIGHT; // for placement within toolbar (todo: phase this out)
    cssClass = 'undo-container';
    undobutton:UndoButtonView;
    redobutton:RedoButtonView;

    init() {
        this.childViewTypes = {
            undobutton: UndoButtonView,
            redobutton: RedoButtonView
        };
    }
    layoutDown() {
        var p:Layout = this.parentView.layout;
        this.layout = {
            top: 4,
            left: p.width-100-5,
            width: 100,
            height: 36
        }
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
            (ActionManager.nextUndo() !== -1) === (b.undobutton.isEnabled),
            "Undo button does not match nextUndo()");
        assert(
            (ActionManager.nextRedo() !== -1) === (b.redobutton.isEnabled),
            "Redo button does not match nextUndo()");
    }
}
