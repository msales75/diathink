var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

var PageContentView = (function (_super) {
    __extends(PageContentView, _super);
    function PageContentView() {
        _super.apply(this, arguments);
        this.cssClass = "grid-wrapper";
    }
    PageContentView.prototype.init = function () {
        this.childViewTypes = {
            leftbutton: LeftSwipeButtonView,
            rightbutton: RightSwipeButtonView,
            gridwrapper: GridContainerView
        };
    };
    PageContentView.prototype.layoutDown = function () {
        var p = this.parentView.layout;
        var s = this.parentView.header.layout;
        this.layout = {
            top: s.height,
            left: 0,
            width: p.width,
            height: p.height - s.height
        };
    };
    return PageContentView;
})(ContainerView);
//# sourceMappingURL=PageContentView.js.map
