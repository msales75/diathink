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
            if (item.nodeRootView == null) {
                continue;
            }
            var header = item.header;
            item.dimensions = {
                width: $(header.elem).outerWidth(),
                height: $(header.elem).outerHeight()
            };
            var p = header.getOffset();
            item.position = {
                left: p.left,
                top: p.top
            };
        }
        return this;
    };

    NodeView.prototype.getLastChild = function () {
        var childlist = this.children.listItems;
        if (childlist.count === 0) {
            return this;
        } else {
            return NodeView.nodesById[childlist.last()].getLastChild();
        }
    };

    NodeView.prototype.nextVisibleNode = function (skipchildren) {
        if (skipchildren === undefined) {
            skipchildren = false;
        }
        assert(this.parentView.listItems != null, "nextVisibleNode called on invalid node");
        if (!skipchildren && (this.children.listItems.count > 0)) {
            return NodeView.nodesById[this.children.listItems.first()];
        }
        var nid = this.parentView.listItems.next[this.id];
        if (nid !== '') {
            return NodeView.nodesById[nid];
        } else if (this.parentView.nodeView != null) {
            return this.parentView.nodeView.nextVisibleNode(true);
        } else {
            return null;
        }
    };

    NodeView.prototype.prevVisibleNode = function () {
        assert(this.parentView.listItems != null, "nextVisibleNode called on invalid node");
        var nid = this.parentView.listItems.prev[this.id];
        if (nid !== '') {
            return NodeView.nodesById[nid].getLastChild();
        } else if (this.parentView.nodeView != null) {
            return this.parentView.nodeView;
        } else {
            return null;
        }
    };

    NodeView.prototype.init = function () {
        this.modelType = OutlineNodeModel;
        this.childViewTypes = {
            header: NodeHeaderView,
            children: OutlineListView
        };
        NodeView.nodesById[this.id] = this;
    };

    NodeView.prototype.destroy = function (opts) {
        delete NodeView.nodesById[this.id];
        var boxes = this.dropboxes;
        var i;
        if (boxes && boxes.length) {
            for (i = 0; i < boxes.length; ++i) {
                boxes[i].remove();
            }
        }
        this.dropboxes = [];
        _super.prototype.destroy.call(this, opts);
    };

    NodeView.prototype.removeFromModel = function () {
        if (this.nodeRootView) {
            this.value.clearView(this.nodeRootView); // remove view from model-outline
        }
    };

    NodeView.prototype.updateValue = function () {
        if (this.nodeRootView == null) {
            return;
        }
        if (this.value) {
            this.value.addView(this); // register view.id in model
            if (this.value.attributes.owner !== $D.userID) {
                this.readOnly = true;
            } else {
                this.readOnly = false;
            }
        }
        this.isBreadcrumb = false;
        if (this.parentView.searchList != null) {
            this.readOnly = true;
            this.isBreadcrumb = true;
        }

        // check outline and value for collapse-status
        if (this.value) {
            this.isCollapsed = this.value.get('collapsed');
            var outline = OutlineRootView.outlinesById[this.nodeRootView.id];
            var collapseTest = this.nodeRootView.getData(this.value.cid);
            if (collapseTest != null) {
                this.isCollapsed = collapseTest;
            }
        }
    };

    NodeView.prototype.render = function () {
        this._create({
            type: 'li',
            classes: 'ui-li ui-li-static ui-btn-up-c ' + this.cssClass
        });
        if (this.panelView && this.panelView.browseChat) {
            this.isCollapsed = true;
        }

        // todo: make list-children rendering contingent on collapsed-value
        this.renderChildViews();
        this.positionChildren(null);
        this.setPosition();
        while (this.value && this.value.attributes.backLinks && (this.value.attributes.backLinks.count > this.header.linkcount.numLinks)) {
            this.header.linkcount.addLink();
        }
        for (var name in this.childViewTypes) {
            this.elem.appendChild((this[name]).elem);
        }
        if (this.isCollapsed) {
            this.isLeaf = false;
            this.addClass('branch').removeClass('leaf').addClass('collapsed').removeClass('expanded');
        } else {
            if (this.children.elem.children.length > 0) {
                // this is defined because rendering is bottom-up
                this.isLeaf = false;
                this.addClass('branch').removeClass('leaf').addClass('expanded').removeClass('collapsed');
            } else {
                this.isLeaf = true;
                this.addClass('leaf').removeClass('branch').addClass('expanded').removeClass('collapsed');
            }
        }
        if (this.readOnly) {
            this.addClass('readonly');
        }
        this.header.handle.renderUpdate();

        /*
        if (this.header.name.text.value.length > 3) {
        this.header.name.text.fixHeight();
        }
        */
        this.layoutUp(); // don't call setPosition for nodes, they are set by list-parent
        return this.elem;
    };

    NodeView.prototype.layoutDown = function () {
        if (!this.layout) {
            this.layout = {};
        }
        this.layout.width = this.parentView.layout.width;
        this.layout.left = 0;
    };

    NodeView.prototype.layoutUp = function () {
        this.layout.height = this.header.layout.height + this.children.layout.height;
    };

    NodeView.prototype.positionChildren = function (v, v2, validate) {
        if (!v || (v === this.header)) {
            if (this.children) {
                var l = this.children.saveLayout();
                this.children.layoutDown();
                this.children.updateDiffs(l, validate);
            }
        }
    };

    NodeView.prototype.setCollapsed = function (collapsed) {
        if (this.isLeaf) {
            collapsed = false;
        }
        if (this.panelView && this.panelView.browseChat) {
            collapsed = true;
        }
        if (collapsed === this.isCollapsed) {
            return;
        }
        this.isCollapsed = collapsed;
        if (collapsed) {
            this.addClass('collapsed').removeClass('expanded');
            this.children.collapseList();
        } else {
            this.addClass('expanded').removeClass('collapsed');
            if (!this.isLeaf) {
                this.children.expandList();
            }
        }
        this.header.handle.renderUpdate();
    };

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
        this.header.handle.renderUpdate();
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
        if (!(this instanceof ChatBoxView)) {
            assert(this.nodeRootView != null, "NodeView cannot have null nodeRootView");
        }
        assert(this.value instanceof OutlineNodeModel, "NodeView  " + v + " value is not a model");
        if (this.children) {
            assert(models[this.value.cid].attributes.children === this.children.value, "NodeView " + v + " has value-children different than children-value");
        }
        if (!(this instanceof ChatBoxView)) {
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
        }
    };
    NodeView.nodesById = {};
    return NodeView;
})(View);
//# sourceMappingURL=NodeView.js.map
