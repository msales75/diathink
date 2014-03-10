///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");
class ScrollSpacerView extends ContainerView {
    init() {
        this.Class = ScrollSpacerView;
    }
    cssClass = 'scroll-spacer';
}

