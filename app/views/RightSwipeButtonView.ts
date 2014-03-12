///<reference path="View.ts"/>
m_require("app/views/SpanView.js");
class RightSwipeButtonView extends SpanView {
    init() {
        this.Class = RightSwipeButtonView;
        this.isClickable = true;
    }
    cssClass = 'right-button';
    value = '>';
    onClick() {
        ActionManager.schedule(
            function() {
                if (View.focusedView) {
                    return $D.Action.checkTextChange(View.focusedView.header.name.text.id);
                } else {
                    return null;
                }
            },
            function() {
                return {
                    action: $D.SlideAction,
                    direction: 'left',
                    focus: false
                };
            });
    }
}
