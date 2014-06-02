var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
///<reference path="../events/Router.ts"/>
m_require("app/views/ContainerView.js");

var DeadPanel = (function (_super) {
    __extends(DeadPanel, _super);
    function DeadPanel(panel) {
        _super.call(this, panel);
        this.outlineID = panel.outline.id;
    }
    DeadPanel.prototype.getOptions = function () {
        return {
            id: this.id,
            parentView: View.get(this.parent),
            value: this.value,
            childOpts: {
                outline: {
                    id: this.outlineID
                }
            }
        };
    };
    DeadPanel.prototype.resurrect = function () {
        delete DeadView.viewList[this.id];
        return new PanelView(this.getOptions());
    };
    DeadPanel.prototype.validate = function () {
        _super.prototype.validate.call(this);
        assert(this.value instanceof OutlineNodeModel, "Panel " + this.id + " does not have a valid value");
        assert(DeadView.viewList[this.outlineID] instanceof DeadOutlineScroll, "Dead panel " + this.id + " does not have dead outline " + this.outlineID);
    };
    return DeadPanel;
})(DeadView);

var PanelView = (function (_super) {
    __extends(PanelView, _super);
    function PanelView() {
        _super.apply(this, arguments);
        this.cssClass = 'panel';
        this.animating = false;
    }
    PanelView.prototype.init = function () {
        this.childViewTypes = {
            breadcrumbs: BreadcrumbView,
            inserter: InsertionView,
            outline: OutlineScrollView,
            deletebutton: PanelDeleteView
        };
        assert(PanelView.panelsById[this.id] === undefined, "Multiple panels with same ID");
        PanelView.panelsById[this.id] = this;
    };
    PanelView.prototype.updateValue = function () {
        if (this.parentPanel != null) {
            assert(this.parentPanel instanceof PanelView, "");
            this.parentPanel.childPanel = this;
        }
    };
    PanelView.prototype.layoutDown = function () {
        var p = this.parentView.parentView.layout;
        this.layout = {
            top: 0,
            width: this.parentView.itemWidth,
            height: p.height
        };
    };
    PanelView.prototype.positionChildren = function (v) {
        if (!v || (v === this.breadcrumbs)) {
            var l = this.outline.saveLayout();
            this.outline.layoutDown();
            this.outline.updateDiffs(l);
            var l2 = this.inserter.saveLayout();
            this.inserter.layout.top = this.breadcrumbs.layout.height + Math.round(0.5 * View.fontSize);
            this.inserter.updateDiffs(l2);
        }
    };

    PanelView.prototype.render = function () {
        var subpanel = '';
        if (this.parentPanel != null) {
            subpanel = '<div class="subpanel"></div>';
        }
        this._create({
            type: 'div',
            classes: this.cssClass,
            html: '<div class="panel-border"></div>' + subpanel
        });
        this.renderChildViews();
        this.positionChildren(null);
        this.setPosition();
        for (var name in this.childViewTypes) {
            this.elem.appendChild((this[name]).elem);
        }
        return this.elem;
    };

    PanelView.prototype.cachePosition = function () {
        // todo: cache top/left/height/width
        var offset = this.getOffset();
        this.top = offset.top;
        this.left = offset.left;
        this.height = this.layout.height;
        this.width = this.layout.width;
    };

    PanelView.prototype.destroy = function () {
        delete PanelView.panelsById[this.id];
        new DeadPanel(this);
        if (this.parentPanel != null) {
            assert(this.parentPanel.childPanel === this, "");
            this.parentPanel.childPanel = null;
        }
        var i;
        var boxes = this.dropboxes;
        if (boxes && boxes.length) {
            for (i = 0; i < boxes.length; ++i) {
                boxes[i].remove();
            }
        }
        this.dropboxes = [];
        _super.prototype.destroy.call(this);
    };

    PanelView.prototype.changeRoot = function (model, rootID) {
        var newlist, deadRoot;
        var c = this.outline.alist.destroy();
        if (model === undefined) {
            model = null;
        }
        this.value = model;
        if (rootID != null) {
            assert(DeadView.viewList[rootID] instanceof DeadOutlineRoot, "RootID " + rootID + " is not in dead outline list");
        }
        newlist = new OutlineRootView({
            id: rootID,
            parentView: this.outline
        });
        this.outline.alist = newlist;
        this.outline.alist.renderAt(c);
        this.breadcrumbs.updateValue();
        this.breadcrumbs.renderUpdate();
        this.cachePosition();
        NodeView.refreshPositions();

        // $(window).resize(); // fix height of new panel, spacer; a bit hacky
        return newlist.id;
    };
    PanelView.prototype.validate = function () {
        _super.prototype.validate.call(this);
        var v = this.id;
        var outlines = OutlineRootView.outlinesById;
        var models = OutlineNodeModel.modelsById;
        var panels = PanelView.panelsById;

        assert(panels[this.id] === this, "Panel " + this.id + " not in list");
        assert(this.panelView === this, "View " + v + " is a panelView that doesn't know it");

        assert(this.isFocusable === false, "PanelView " + v + " does not have isFocuable===false");
        assert(this.isDragHandle === false, "PanelView " + v + " does not have isFocuable===false");
        assert(this.isScrollable === false, "PanelView " + v + " does not have isScrollable===false");
        assert(this.isSwipable === false, "PanelView " + v + " does not have isSwipable===false");
        assert(this.nodeRootView === null, "PanelView " + v + " has nodeRootView not-null");
        assert(this.nodeView === null, "PanelView " + v + " has nodeView not-null");
        assert(this.scrollView === null, "PanelView " + v + " has scrollView not-null");
        assert(this.handleView === null, "PanelView " + v + " has handleView not-null");
        assert(this.clickView === null, "PanelView " + v + " has clickView not-null");
        assert(this.panelView === this, "PanelView " + v + " has panelView not-self");

        assert(this.breadcrumbs instanceof BreadcrumbView, "Panel " + v + " does not have breadcrumbs of correct type");
        assert(this.outline instanceof OutlineScrollView, "Panel " + v + " does not have outline of type OutlineScrollView");
        assert(this.outline.alist instanceof OutlineRootView, "Panel " + v + " has outline.alist without type OutlineRootView");

        assert(this.value === models[this.value.cid], "Panel " + v + " does not have a valid value");
        assert(this.value.get('children') === this.outline.alist.value, "Panel " + v + " does not have value match outline.alist.value");

        assert(this.parentView.listItems.obj[this.id] === this, "Panel " + this.id + " is not in grid listItems");

        assert(this.outline.value === null, "Panel " + v + " outline-value is not null");
    };
    PanelView.panelsById = {};
    return PanelView;
})(View);
//# sourceMappingURL=PanelView.js.map
