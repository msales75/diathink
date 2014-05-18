///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

class GridContainerView extends ContainerView {
    grid: PanelGridView;
    cssClass= 'horizontal-grid-container';
    init() {
        this.childViewTypes = {
            grid: PanelGridView
        };
    }
    layoutDown() {
        var p:Layout = this.parentView.layout;
        this.layout = {
            top: 0,
            left: Math.round(.05* p.width),
            width: p.width - 2*Math.round(0.05* p.width),
            height:p.height
        };
    }
}