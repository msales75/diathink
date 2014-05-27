///<reference path="View.ts"/>
m_require("app/views/SpanView.js");

class LeftSwipeButtonView extends SpanView {
    parentView:PageContentView;
    init() {
        this.isClickable = true;
    }
    cssClass = 'left-button';
    value = '<';
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
                    direction: 'right',
                    focus: false
                };
            });
    }
    layoutDown() {
        var p:Layout = this.parentView.layout;
        this.layout = {
            top: 1.5*View.fontSize,
            left: 0,
            width: Math.round(.05* p.width)
        };
    }
}
