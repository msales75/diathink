///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

class HiddenDivView extends ContainerView {
    cssClass = 'hiddendiv';
    layoutDown() {
        this.layout = {
            top: 10,
            left: 10
        }
    }
}
