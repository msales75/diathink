///<reference path="View.ts"/>
m_require("app/views/SpanView.js");
class HeaderTitleView extends SpanView {
    init() {
        this.Class = HeaderTitleView;
    }
    anchorLocation:any = M.LEFT;
    value = "";
}

