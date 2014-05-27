///<reference path="View.ts"/>
m_require("app/views/ButtonView.js");
class RedoButtonView extends ButtonView {
    parentView:UndoButtonContainerView;
    value:string = 'theme/images/redo.png';
    cssClass = 'redo-button';
    init() {
        this.isClickable = true;
    }
    onClick(params:DragStartI) {
        ActionManager.redo()
    }
    layoutDown() {
        this.layout = {
            top: 0,
            left: 44,
            width: 36,
            height: 36
        }
    }
}

