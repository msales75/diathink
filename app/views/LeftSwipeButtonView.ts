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
        $D.ActionManager.schedule(
            function() {
                if ($D.focused) {
                    return $D.Action.checkTextChange($D.focused.header.name.text.id);
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
