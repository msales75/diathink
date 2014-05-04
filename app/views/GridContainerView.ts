///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

class GridContainerView extends ContainerView {
    grid: PanelGridView;
    cssClass= 'horizontal-grid-container';
    init() {
        this.Class = GridContainerView;
        this.childViewTypes = {
            grid: PanelGridView
        };
    }

}