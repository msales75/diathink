var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ScrollView.js");
var DeadOutlineScroll = (function (_super) {
    __extends(DeadOutlineScroll, _super);
    function DeadOutlineScroll(outline) {
        _super.call(this, outline);
        this.rootID = outline.alist.id;
    }
    DeadOutlineScroll.prototype.getOptions = function () {
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
    };
    DeadOutlineScroll.prototype.resurrect = function () {
        delete DeadView.viewList[this.id];
        return new OutlineScrollView(this.getOptions());
    };

    DeadOutlineScroll.prototype.validate = function () {
        _super.prototype.validate.call(this);
        assert(DeadView.viewList[this.rootID] instanceof DeadOutlineRoot, "Dead panel " + this.id + " does not have dead outline " + this.rootID);
    };
    return DeadOutlineScroll;
})(DeadView);

var OutlineScrollView = (function (_super) {
    __extends(OutlineScrollView, _super);
    function OutlineScrollView() {
        _super.apply(this, arguments);
    }
    OutlineScrollView.prototype.init = function () {
        this.childViewTypes = {
            alist: OutlineRootView,
            // scrollSpacer: ScrollSpacerView,
            droplayer: DropLayerView
        };
    };
    OutlineScrollView.prototype.destroy = function () {
        new DeadOutlineScroll(this);
        _super.prototype.destroy.call(this);
    };
    OutlineScrollView.prototype.getOffset = function () {
        var scroll;
        var pos = _super.prototype.getOffset.call(this);
        pos.top -= this.scrollHandler.getScrollPosition().y;
        return pos;
    };
    OutlineScrollView.prototype.layoutDown = function () {
        var p = this.parentView.layout;
        if (!this.layout) {
            this.layout = {};
        }
        this.layout.left = Math.round(View.fontSize);
        this.layout.width = p.width - Math.round(View.fontSize) - 2;
        if (this.parentView && this.parentView.breadcrumbs && this.parentView.breadcrumbs.layout && this.parentView.chatbox && this.parentView.chatbox.layout) {
            this.layout.top = this.parentView.breadcrumbs.layout.height;
            this.layout.height = p.height - this.parentView.breadcrumbs.layout.height - this.parentView.chatbox.layout.height;
        }
    };
    OutlineScrollView.prototype.layoutUp = function () {
        // todo: inner-scroll height needs to be reset in layoutUp
    };
    OutlineScrollView.prototype.positionChildren = function (v, v2, validate) {
        // whenever scroll-height changes, need to adjust canvas size
        if (validate) {
            assert(this.droplayer.layout.height === this.alist.layout.height, "Droplayer has invalid height");
        }

        // console.log("Setting droplayer height here to "+this.alist.layout.height);
        this.droplayer.layout.height = this.alist.layout.height;
        this.droplayer.elem.style.height = this.droplayer.layout.height + 'px';
    };

    OutlineScrollView.prototype.validate = function () {
        _super.prototype.validate.call(this);
        var v = this.id;
        assert(this.scrollView === this, "View " + v + " is a scrollView that doesn't know it");
        assert(this.parentView instanceof PanelView, "ScrollView " + v + " does not have paneloutlineview parent");
        assert(this.parentView.outline === this, "ScrollView " + v + " does not match parentview.outline");
    };
    return OutlineScrollView;
})(ScrollView);
//# sourceMappingURL=OutlineScrollView.js.map
