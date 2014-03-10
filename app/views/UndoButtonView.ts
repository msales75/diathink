///<reference path="View.ts"/>
m_require("app/views/ButtonView.js");
class UndoButtonView extends ButtonView {
    init() {
        this.Class = UndoButtonView;
    }
    cssClass = 'undo-button';
}

