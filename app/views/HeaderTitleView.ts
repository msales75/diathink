///<reference path="View.ts"/>
m_require("app/views/SpanView.js");
class HeaderTitleView extends SpanView {
    parentView:HeaderToolbarView;
    anchorLocation:any = M.LEFT;
    value = "";
    layoutDown() {
        this.layout = {
            top: 2,
            left: 0,
            height: this.parentView.layout.height-4
        }
    }
}

