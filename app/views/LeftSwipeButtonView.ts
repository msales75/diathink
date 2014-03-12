///<reference path="View.ts"/>
m_require("app/views/SpanView.js");

class LeftSwipeButtonView extends SpanView {
    init() {
        this.Class = LeftSwipeButtonView;
        this.isClickable = true;
    }
    cssClass = 'left-button';
    value = '<';
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
                    direction: 'right',
                    focus: false
                };
            });
    }
}
