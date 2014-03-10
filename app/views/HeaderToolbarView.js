var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ToolbarView.js");

var HeaderToolbarView = (function (_super) {
    __extends(HeaderToolbarView, _super);
    function HeaderToolbarView() {
        _super.apply(this, arguments);
        this.anchorLocation = M.TOP;
        this.cssClass = 'ui-header ui-bar-a ui-header-fixed slidedown';
    }
    HeaderToolbarView.prototype.init = function () {
        this.Class = HeaderToolbarView;
        this.childViewTypes = {
            title: HeaderTitleView,
            undobuttons: UndoButtonContainerView
        };
    };
    return HeaderToolbarView;
})(ToolbarView);
//# sourceMappingURL=HeaderToolbarView.js.map
