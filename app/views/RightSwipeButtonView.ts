///<reference path="View.ts"/>
m_require("app/views/SpanView.js");
class RightSwipeButtonView extends SpanView {
    init() {
        this.Class = RightSwipeButtonView;
    }
    cssClass = 'right-button';
    value = '>';
}
