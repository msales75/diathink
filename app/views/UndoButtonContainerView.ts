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
}
