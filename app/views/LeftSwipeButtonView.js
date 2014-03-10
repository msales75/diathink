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
        this.Class = LeftSwipeButtonView;
    };
    return LeftSwipeButtonView;
})(SpanView);
//# sourceMappingURL=LeftSwipeButtonView.js.map
