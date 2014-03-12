///<reference path="View.ts"/>
m_require("app/views/ButtonView.js");
class UndoButtonView extends ButtonView {
    init() {
        this.Class = UndoButtonView;
        this.isClickable = true;
    }
    onClick() {
        ActionManager.undo()
    }

    cssClass = 'undo-button';
}

