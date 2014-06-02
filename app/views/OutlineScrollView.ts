///<reference path="View.ts"/>
m_require("app/views/ScrollView.js");
class DeadOutlineScroll extends DeadView {
    rootID:string;

    constructor(outline:OutlineScrollView) {
        super(outline);
        this.rootID = outline.alist.id;
    }

    getOptions() {
        return {
            id: this.id,
            parentView: View.get(this.parent),
            value: this.value,
            childOpts: {
                alist: {
                    id: this.rootID
                }
            }
        };
    }
    resurrect():OutlineScrollView {
        delete DeadView.viewList[this.id];
        return new OutlineScrollView(this.getOptions());
    }

    validate() {
        super.validate();
        assert(DeadView.viewList[this.rootID] instanceof DeadOutlineRoot,
            "Dead panel " + this.id + " does not have dead outline " + this.rootID);
    }
}

class OutlineScrollView extends ScrollView {
    parentView:PanelView;
    alist:OutlineRootView;
    // scrollSpacer:ScrollSpacerView;
    droplayer:DropLayerView;
    scrollY:number; // for use in draghandler
    init() {
        this.childViewTypes = {
            alist: OutlineRootView,
            // scrollSpacer: ScrollSpacerView,
            droplayer: DropLayerView
        };
    }
    destroy() {
        new DeadOutlineScroll(this);
        super.destroy();
    }
    getOffset() {
        var scroll:number;
        var pos = super.getOffset();
        pos.top -= this.scrollHandler.getScrollPosition().y;
        return pos;
    }
    layoutDown() {
        var p:Layout = this.parentView.layout;
        if (this.parentView && this.parentView.breadcrumbs && this.parentView.breadcrumbs.layout) {
            if (!this.layout) {this.layout = {};}
            this.layout.top= this.parentView.breadcrumbs.layout.height;
            this.layout.left = Math.round(View.fontSize);
            this.layout.width = p.width-Math.round(View.fontSize)-2;
        }
    }
    layoutUp() {
        var p:Layout = this.parentView.layout;
        this.layout.height = p.height-this.parentView.breadcrumbs.layout.height;
        // todo: inner-scroll height needs to be reset in layoutUp
    }

    validate() {
        super.validate();
        var v = this.id;
        assert(this.scrollView === this,
            "View " + v + " is a scrollView that doesn't know it");
        assert(this.parentView instanceof PanelView,
            "ScrollView " + v + " does not have paneloutlineview parent");
        assert(this.parentView.outline === this,
            "ScrollView " + v + " does not match parentview.outline");
    }

    /* updateScroll: $D.updateScroll, */ // called whenever scrollview changes
}
