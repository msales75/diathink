var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/SpanView.js");

var LeftSwipeButtonView = (function (_super) {
    __extends(LeftSwipeButtonView, _super);
    function LeftSwipeButtonView() {
        _super.apply(this, arguments);
        this.cssClass = 'left-button';
        this.value = '<';
    }
    LeftSwipeButtonView.prototype.init = function () {
        this.isClickable = true;
    };

    LeftSwipeButtonView.prototype.onClick = function (params) {
        ActionManager.schedule(function () {
            if (View.focusedView) {
                return Action.checkTextChange(View.focusedView.header.name.text.id);
            } else {
                return null;
            }
        }, function () {
            return {
                actionType: SlidePanelsAction,
                name: 'Swipe right',
                direction: 'right',
                focus: false
            };
        });
    };
    LeftSwipeButtonView.prototype.layoutDown = function () {
        var p = this.parentView.layout;
        this.layout = {
            top: 1.5 * View.fontSize,
            left: 0,
            width: Math.round(.05 * p.width)
        };
    };
    return LeftSwipeButtonView;
})(SpanView);
//# sourceMappingURL=LeftSwipeButtonView.js.map
