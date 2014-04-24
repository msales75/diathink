var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ListView.js");

var DeadOutlineRoot = (function (_super) {
    __extends(DeadOutlineRoot, _super);
    function DeadOutlineRoot(outline) {
        _super.call(this, outline);
        this.data = outline.data;
    }
    DeadOutlineRoot.prototype.getOptions = function () {
        return {
            id: this.id,
            parentView: View.get(this.parent),
            value: this.value,
            data: this.data
        };
    };
    DeadOutlineRoot.prototype.resurrect = function () {
        delete DeadView.viewList[this.id];
        return new OutlineRootView(this.getOptions());
    };
    DeadOutlineRoot.prototype.validate = function () {
        _super.prototype.validate.call(this);
        assert(this.value instanceof OutlineNodeCollection, "DeadOutline " + this.id + " does not have a valid value");
    };
    return DeadOutlineRoot;
})(DeadView);
var OutlineRootView = (function (_super) {
    __extends(OutlineRootView, _super);
    function OutlineRootView(opts) {
        _super.call(this, opts);
        OutlineRootView.outlinesById[this.id] = this;
    }
    OutlineRootView.prototype.init = function () {
        this.listItemTemplate = NodeView;
        this.Class = OutlineRootView;
    };

    OutlineRootView.prototype.updateValue = function () {
        if (this.panelView != null) {
            assert(this.parentView.parentView instanceof PanelView, "Invalid location for root list");
            this.value = this.panelView.value.get('children');
        }
    };

    OutlineRootView.prototype.destroy = function () {
        var context, elem = this.elem;
        if (elem) {
            context = this.saveContext();
        } else {
            context = null;
        }
        new DeadOutlineRoot(this); // move to graveyard
        delete OutlineRootView.outlinesById[this.id];
        _super.prototype.destroy.call(this);
        return context;
    };

    OutlineRootView.prototype.setData = function (key, val) {
        if (!this.data) {
            this.data = {};
        }
        if (val != null) {
            this.data[key] = val;
        } else {
            delete this.data[key];
        }
    };

    OutlineRootView.prototype.getData = function (key) {
        if (!this.data) {
            return null;
        } else if (this.data[key] == null) {
            return null;
        } else {
            return this.data[key];
        }
    };
    OutlineRootView.prototype.validate = function () {
        _super.prototype.validate.call(this);
        var outlines = OutlineRootView.outlinesById;
        var panels = PanelView.panelsById;
        var o = this.id;
        assert(outlines[this.id] === this, "Outline " + this.id + " not in list");
        assert(_.size(this.childViewTypes) === 0, "Outline view " + o + " does not have zero childViewTypes");
        assert(this.nodeRootView === this, "OutlineRootView " + o + " does not have nodeRootView==self");
        assert(this.parentView.nodeRootView === null, "OutlineRootView " + o + " has parent with same nodeRootView");

        // for now, require all outlines to be in a panel
        assert(panels[this.parentView.parentView.id] instanceof PanelView, "Outline view " + o + " does not have parent-parent-view a panel");
        assert(this.parentView.parentView.outline.alist === this, "Outline view " + o + " does not match parent.parent.outline.alist in a panel");
        assert(this.value instanceof OutlineNodeCollection, "OutlineRootView " + o + " does not have value of type OutlineNodeCollection");
        // todo: validate this.data[key]=val
    };
    OutlineRootView.outlinesById = {};
    return OutlineRootView;
})(ListView);
//# sourceMappingURL=OutlineRootView.js.map
