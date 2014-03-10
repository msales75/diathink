var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ScrollView.js");

var OutlineScrollView = (function (_super) {
    __extends(OutlineScrollView, _super);
    function OutlineScrollView() {
        _super.apply(this, arguments);
    }
    OutlineScrollView.prototype.init = function () {
        this.Class = OutlineScrollView;
        this.childViewTypes = {
            alist: OutlineRootView,
            scrollSpacer: ScrollSpacerView,
            droplayer: DropLayerView
        };
    };
    return OutlineScrollView;
})(ScrollView);
//# sourceMappingURL=OutlineScrollView.js.map
