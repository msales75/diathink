///<reference path="View.ts"/>
m_require("app/views/ButtonView.js");
class UndoButtonView extends ButtonView {
    parentView:UndoButtonContainerView;
    value:string = 'theme/images/undo.png';
    init() {
        this.isClickable = true;
    }
    onClick(params:DragStartI) {
        ActionManager.undo();
    }
    layoutDown() {
        this.layout = {
            top: 0,
            left: 4,
            width: 36,
            height: 36
        };
    }

    cssClass = 'undo-button';
}

