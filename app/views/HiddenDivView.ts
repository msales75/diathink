///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

class HiddenDivView extends ContainerView {
    init() {
        this.Class = HiddenDivView;
    }
    cssClass = 'hiddendiv';
}
