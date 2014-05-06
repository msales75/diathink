///<reference path="View.ts"/>
m_require("app/views/SpanView.js");

class LeftSwipeButtonView extends SpanView {
    init() {
        this.isClickable = true;
    }
    cssClass = 'left-button';
    value = '<';
    onClick() {
        ActionManager.schedule(
            function():SubAction {
                if (View.focusedView) {
                    return Action.checkTextChange(View.focusedView.header.name.text.id);
                } else {
                    return null;
                }
            },
            function():SubAction {
                return {
                    actionType: SlidePanelsAction,
                    direction: 'right',
                    focus: false
                };
            });
    }
}
