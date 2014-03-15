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
                    return Action.checkTextChange(View.focusedView.header.name.text.id);
                } else {
                    return null;
                }
            },
            function() {
                return {
                    action: SlidePanelsAction,
                    direction: 'left',
                    focus: false
                };
            });
    }
}
