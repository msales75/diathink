var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");
var ScrollSpacerView = (function (_super) {
    __extends(ScrollSpacerView, _super);
    function ScrollSpacerView() {
        _super.apply(this, arguments);
        this.cssClass = 'scroll-spacer';
    }
    return ScrollSpacerView;
})(ContainerView);
//# sourceMappingURL=ScrollSpacerView.js.map
