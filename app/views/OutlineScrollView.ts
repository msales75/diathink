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
    scrollSpacer:ScrollSpacerView;
    droplayer:DropLayerView;
    scrollY:number; // for use in draghandler
    init() {
        this.Class = OutlineScrollView;
        this.childViewTypes = {
            alist: OutlineRootView,
            scrollSpacer: ScrollSpacerView,
            droplayer: DropLayerView
        };
    }
    destroy() {
        new DeadOutlineScroll(this);
        super.destroy();
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
