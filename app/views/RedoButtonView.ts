///<reference path="View.ts"/>
m_require("app/views/ButtonView.js");
class RedoButtonView extends ButtonView {
    cssClass = 'redo-button';
    init() {
        this.isClickable = true;
    }
    onClick(){
        ActionManager.redo()
    }
}

