///<reference path="View.ts"/>
///<reference path="../main.ts"/>
m_require("app/views/ButtonView.js");
class LogoImageView extends ButtonView {
    parentView:HeaderToolbarView;
    value:string = 'theme/images/diaclear-icon-t.png';
    init() {
        this.isClickable = true;
    }
    onClick(params:DragStartI) {
        saveSnapshot();
    }
    layoutDown() {
        this.layout = {
            top: 2,
            left: 20,
            width: 56,
            height: 35
        };
    }

   //  cssClass = 'undo-button';
}

