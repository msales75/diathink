///<reference path="View.ts"/>
m_require("app/views/SpanView.js");

class LeftSwipeButtonView extends SpanView {
    init() {
        this.Class = LeftSwipeButtonView;
    }
    cssClass = 'left-button';
    value = '<';
}
