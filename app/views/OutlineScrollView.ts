///<reference path="View.ts"/>
m_require("app/views/ScrollView.js");

class OutlineScrollView extends ScrollView {
    parentView:PanelView;
    alist:OutlineRootView;
    scrollSpacer:ScrollSpacerView;
    droplayer:DropLayerView;
    scrollY:number; // for use in draghandler

    init() {
        this.Class = OutlineScrollView;
        this.childViewTypes = {
            alist: OutlineRootView,
            scrollSpacer: ScrollSpacerView,
            droplayer: DropLayerView
        };
    }

    /* updateScroll: $D.updateScroll, */ // called whenever scrollview changes
}
