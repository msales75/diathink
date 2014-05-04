///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

class PageContentView extends ContainerView {
    cssClass = "grid-wrapper";
    leftbutton:LeftSwipeButtonView;
    rightbutton:RightSwipeButtonView;
    gridwrapper:GridContainerView;

    init() {
        this.Class = PageContentView;
        this.childViewTypes = {
            leftbutton: LeftSwipeButtonView,
            rightbutton: RightSwipeButtonView,
            gridwrapper: GridContainerView
        };
    }
}
