///<reference path="View.ts"/>
m_require("app/views/PageView.js");
m_require("app/views/PageView.js");
class DiathinkView extends PageView {
    cssClass = 'ui-page ui-body-c ui-page-header-fixed ui-page-active ui-sortable';
    public hiddendiv:HiddenDivView;
    public header:HeaderToolbarView;
    public content:PageContentView;
    public drawlayer:DrawLayerView;

    init() {
        this.Class = DiathinkView;
        this.childViewTypes = {
            hiddendiv: HiddenDivView,
            header: HeaderToolbarView,
            content: PageContentView,
            drawlayer: DrawLayerView
        };
        assert(View.currentPage == null,
            "Page assigned more than once");
        View.currentPage = this;
    }
}

