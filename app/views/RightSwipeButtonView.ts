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
                    direction: 'left',
                    focus: false
                };
            });
    }
}
