///<reference path="View.ts"/>
m_require("app/views/GridView.js");

class PanelGridView extends GridView {
    cssClass = "scroll-container";
    panelManager:any = PanelManager;
    layout = TWO_COLUMNS;
    scroll1:PanelView;
    scroll2:PanelView;

    init() {
        this.Class = PanelGridView;
        this.childViewTypes = {
            scroll1: PanelView,
            scroll2: PanelView
        };
    }
}

