///<reference path="View.ts"/>
m_require("app/views/ScrollView.js");

class OutlineScrollView extends ScrollView {
    alist:OutlineRootView;
    scrollSpacer:ScrollSpacerView;
    droplayer:DropLayerView;

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
