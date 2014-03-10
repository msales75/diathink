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
        this.Class = RightSwipeButtonView;
    };
    return RightSwipeButtonView;
})(SpanView);
//# sourceMappingURL=RightSwipeButtonView.js.map
