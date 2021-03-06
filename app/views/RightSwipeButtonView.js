var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/SpanView.js");
var RightSwipeButtonView = (function (_super) {
    __extends(RightSwipeButtonView, _super);
    function RightSwipeButtonView() {
        _super.apply(this, arguments);
        this.cssClass = 'right-button';
        this.value = '>';
    }
    RightSwipeButtonView.prototype.init = function () {
        this.isClickable = true;
    };

    RightSwipeButtonView.prototype.onClick = function (params) {
        ActionManager.schedule(function () {
            if (View.focusedView) {
                return Action.checkTextChange(View.focusedView.header.name.text.id);
            } else {
                return null;
            }
        }, function () {
            return {
                actionType: SlidePanelsAction,
                name: 'Swipe left',
                direction: 'left',
                focus: false
            };
        });
    };
    RightSwipeButtonView.prototype.layoutDown = function () {
        var p = this.parentView.layout;
        this.layout = {
            top: 1.5 * View.fontSize,
            left: p.width - Math.round(.05 * p.width),
            width: Math.round(.05 * p.width)
        };
    };
    return RightSwipeButtonView;
})(SpanView);
//# sourceMappingURL=RightSwipeButtonView.js.map
