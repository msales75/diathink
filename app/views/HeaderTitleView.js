var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/SpanView.js");
var HeaderTitleView = (function (_super) {
    __extends(HeaderTitleView, _super);
    function HeaderTitleView() {
        _super.apply(this, arguments);
        this.anchorLocation = M.LEFT;
        this.value = "";
    }
    HeaderTitleView.prototype.init = function () {
        this.Class = HeaderTitleView;
    };
    return HeaderTitleView;
})(SpanView);
//# sourceMappingURL=HeaderTitleView.js.map
