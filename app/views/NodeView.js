var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/View.js");

var NodeView = (function (_super) {
    __extends(NodeView, _super);
    function NodeView() {
        _super.apply(this, arguments);
    }
    NodeView.refreshPositions = function () {
        var items = NodeView.nodesById;
        var nid;
        for (nid in items) {
            var item = items[nid];
            var header = item.header;
            item.dimensions = {
                width: $(header.elem).outerWidth(),
                height: $(header.elem).outerHeight()
            };
            var p = $(header.elem).offset();
            item.position = {
                left: p.left,
                top: p.top
            };
        }
        return this;
    };

    NodeView.prototype.init = function () {
        this.Class = NodeView;
        this.modelType = OutlineNodeModel;
        NodeView.nodesById[this.id] = this;
        this.childViewTypes = {
            header: NodeHeaderView,
            children: OutlineListView
        };
    };
    NodeView.prototype.destroy = function (opts) {
        delete NodeView.nodesById[this.id];
        _super.prototype.destroy.call(this, opts);
    };

    NodeView.prototype.updateValue = function () {
        if (this.nodeRootView == null) {
            return;
        }
        if (this.value) {
            this.value.addView(this); // register view.id in model
        }

        // check outline and value for collapse-status
        this.isCollapsed = this.value.get('collapsed');
        var outline = OutlineRootView.outlinesById[this.nodeRootView.id];
        var collapseTest = this.nodeRootView.getData(this.value.cid);
        if (collapseTest != null) {
            this.isCollapsed = collapseTest;
        }
    };

    NodeView.prototype.render = function () {
        this._create({
            type: 'li',
            classes: 'ui-li ui-li-static ui-btn-up-c ' + this.cssClass
        });

        // todo: make list-children rendering contingent on collapsed-value
        this.renderChildViews();
        for (var name in this.childViewTypes) {
            this.elem.appendChild((this[name]).elem);
        }

        if (this.isCollapsed) {
            this.addClass('branch').removeClass('leaf').addClass('collapsed').removeClass('expanded');
        } else {
            if (this.children.elem.children.length > 0) {
                // this is defined because rendering is bottom-up
                this.addClass('branch').removeClass('leaf').addClass('expanded').removeClass('collapsed');
            } else {
                this.addClass('leaf').removeClass('branch').addClass('expanded').removeClass('collapsed');
            }
        }

        if (this.header.name.text.value.length > 3) {
            this.header.name.text.fixHeight();
        }

        return this.elem;
    };

    NodeView.prototype.setCollapsed = function (collapsed) {
        if (collapsed === this.isCollapsed) {
            return;
        }
        this.isCollapsed = collapsed;
        if (collapsed) {
            this.addClass('collapsed').removeClass('expanded');
            this.children.collapseList();
        } else {
            this.addClass('expanded').removeClass('collapsed');
            this.children.expandList();
        }
    };

    // todo: manual list-checking shouldn't be necessary for first/last
    NodeView.prototype.themeFirst = function (first) {
        if (first === this.isFirst) {
            return;
        }
        this.isFirst = first;
        if (first) {
            this.addClass('ui-first-child');
        } else {
            this.removeClass('ui-first-child');
        }
    };

    NodeView.prototype.themeLast = function (last) {
        if (last === this.isLast) {
            return;
        }
        this.isLast = last;
        if (last) {
            this.addClass('ui-last-child');
        } else {
            this.removeClass('ui-last-child');
        }
    };
    NodeView.prototype.themeLeaf = function (leaf) {
        if (leaf === this.isLeaf) {
            return;
        }
        this.isLeaf = leaf;
        if (leaf) {
            this.addClass('leaf').removeClass('branch');
        } else {
            this.addClass('branch').removeClass('leaf');
        }
    };
    NodeView.prototype.validate = function () {
        _super.prototype.validate.call(this);
        var views = View.viewList;
        var nodes = NodeView.nodesById;
        var outlines = OutlineRootView.outlinesById;
        var models = OutlineNodeModel.modelsById;
        var v = this.id;
        var foundit = false;

        assert(views[this.id] === this, "Node " + this.id + " not in list");
        assert(this.nodeView === this, "NodeView does not identify itself as nodeView");
        assert(this.parentView.nodeView !== this, "NodeView parent cannot refer to inner nodeView");
        assert(this.nodeRootView != null, "NodeView cannot have null nodeRootView");
        assert(this.value instanceof OutlineNodeModel, "NodeView  " + v + " value is not a model");
        assert(models[this.value.cid].attributes.children === this.children.value, "NodeView " + v + " has value-children different than children-value");
        assert(this.parentView instanceof ListView, "View " + v + " has type NodeView but parentView is not a ListView");
        assert(this.parentView.value instanceof OutlineNodeCollection, "NodeView " + v + " parent view does not have value OutlineNodeCollection");
        assert(this.parentView.value.obj[this.value.cid] === models[this.value.cid], "NodeView " + v + " parent view's collection does not include item's model ID " + this.value.cid);
        assert(this.value.views[this.nodeRootView.id] === this, "View " + v + " has a model without corresponding view under nodeRootView " + this.nodeRootView.id);

        if (this.value.attributes.parent != OutlineNodeModel.root) {
            if (outlines[this.parentView.id] != null) {
            } else {
                assert(this.parentView.nodeView != null, "NodeView " + v + " does not have a valid parent's parent though it is not the outline-root");
                assert(this.parentView.nodeView instanceof NodeView, "NodeView " + v + " does not have a parent's parent that is also a NodeView, nor is it the outline-root");
                assert(models[this.parentView.nodeView.value.cid] === this.value.attributes.parent, "NodeView " + v + " has a parent NodeView with model id " + this.parentView.nodeView.value.cid + " which does not match model-parent");
            }
        } else {
            assert(outlines[this.parentView.id] != null, "View " + v + " has root-model but is not an outline root");
        }

        if (this.isCollapsed) {
            assert($(this.elem).hasClass('collapsed'), "List item " + this.id + " does not have collapsed class");
            assert(!$(this.elem).hasClass('expanded'), "List item " + this.id + " has expanded class");
        } else {
            assert(!$(this.elem).hasClass('collapsed'), "List item " + this.id + " has collapsed class");
            assert($(this.elem).hasClass('expanded'), "List item " + this.id + " does not have collapsed class");
        }
    };
    NodeView.nodesById = {};
    return NodeView;
})(View);
//# sourceMappingURL=NodeView.js.map
