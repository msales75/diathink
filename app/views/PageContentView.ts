///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

class PageContentView extends ContainerView {
    parentView:DiathinkView;
    cssClass = "grid-wrapper";
    leftbutton:LeftSwipeButtonView;
    rightbutton:RightSwipeButtonView;
    gridwrapper:GridContainerView;

    init() {
        this.childViewTypes = {
            leftbutton: LeftSwipeButtonView,
            rightbutton: RightSwipeButtonView,
            gridwrapper: GridContainerView
        };
    }
    layoutDown() {
        var p:Layout = this.parentView.layout;
        var s:Layout = this.parentView.header.layout;
        this.layout = {
            top: s.height,
            left: 0,
            width: p.width,
            height: p.height- s.height
        };
    }
}
