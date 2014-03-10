var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/PageView.js");
m_require("app/views/PageView.js");
var DiathinkView = (function (_super) {
    __extends(DiathinkView, _super);
    function DiathinkView() {
        _super.apply(this, arguments);
        this.cssClass = 'ui-page ui-body-c ui-page-header-fixed ui-page-active ui-sortable';
    }
    DiathinkView.prototype.init = function () {
        DiathinkView.prototype.postRender = $D.postRender;
        this.Class = DiathinkView;
        this.childViewTypes = {
            hiddendiv: HiddenDivView,
            header: HeaderToolbarView,
            content: PageContentView,
            drawlayer: DrawLayerView
        };
        assert(View.currentPage == null, "Page assigned more than once");
        View.currentPage = this;
    };
    return DiathinkView;
})(PageView);
//# sourceMappingURL=DiathinkView.js.map
