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
        // anchorLocation:any = M.TOP;
        this.cssClass = 'ui-header ui-bar-a ui-header-fixed slidedown';
    }
    HeaderToolbarView.prototype.init = function () {
        this.childViewTypes = {
            title: HeaderTitleView,
            undobuttons: UndoButtonContainerView,
            message: HeaderMessageView,
            logo: LogoImageView
        };
    };
    HeaderToolbarView.prototype.layoutDown = function () {
        this.layout = {
            top: 0,
            left: 0,
            width: this.parentView.layout.width,
            height: 42
        };
    };
    return HeaderToolbarView;
})(ToolbarView);
//# sourceMappingURL=HeaderToolbarView.js.map
