///<reference path="View.ts"/>
m_require("app/views/SpanView.js");
class RightSwipeButtonView extends SpanView {
    init() {
        this.isClickable = true;
    }
    cssClass = 'right-button';
    value = '>';
    onClick(params:DragStartI) {
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
                    direction: 'left',
                    focus: false
                };
            });
    }
    layoutDown() {
        var p:Layout = this.parentView.layout;
        this.layout = {
            top: 1.5*View.fontSize,
            left: p.width - Math.round(.05* p.width),
            width: Math.round(.05* p.width)
        };
    }
}
