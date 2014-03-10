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
        this.Class = PageContentView;
        this.childViewTypes = {
            leftbutton: LeftSwipeButtonView,
            rightbutton: RightSwipeButtonView,
            grid: PanelGridView
        };
    };
    return PageContentView;
})(ContainerView);
//# sourceMappingURL=PageContentView.js.map