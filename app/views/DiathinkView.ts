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
    validate() {
        var views:{[k:string]:View} = View.viewList;
        assert(this===View.currentPage, "Page is not currentPage");
        $('[id]').each(function() {
            assert($('[id="' + this.id + '"]').length === 1,
                "There is more than one DOM element with id=" + this.id);
        });
        $('*').each(function() {
            var withID:HTMLElement = <HTMLElement>this;
            while ((!withID.id) && (withID.parentNode)) {
                withID = <HTMLElement>withID.parentNode;
            }
            if (withID.id) {
                assert(views[withID.id] != null,
                    "Unable to find view for html element ID=" + withID.id);
            }
        });
        super.validate();
        var v:string = this.id;
        assert(this.Class === DiathinkView,
            "PageView " + v + " does not have class=diathinkview");
        assert(this.isFocusable === false,
            "PageView " + v + " does not have isFocuable===false");
        assert(this.isDragHandle === false,
            "PageView " + v + " does not have isFocuable===false");
        assert(this.isScrollable === false,
            "PageView " + v + " does not have isScrollable===false");
        assert(this.isSwipable === false,
            "PageView " + v + " does not have isSwipable===false");
        assert(this.parentView === null,
            "PageView " + v + " has parentView not-null");
        assert(this.nodeRootView === null,
            "PageView " + v + " has nodeRootView not-null");
        assert(this.nodeView === null,
            "PageView " + v + " has nodeView not-null");
        assert(this.scrollView === null,
            "PageView " + v + " has scrollView not-null");
        assert(this.handleView === null,
            "PageView " + v + " has handleView not-null");
        assert(this.panelView === null,
            "PageView " + v + " has panelView not-null");
        assert(this.clickView === null,
            "PageView " + v + " has clickView not-null");
        assert(this.value === null,
            "PageView " + v + " has a value that's not null");
        assert($('#' + this.id).parent().get(0) === $('body').get(0),
            "Page " + v + " is not immediately inside body");
    }
}

