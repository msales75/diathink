///<reference path="View.ts"/>
m_require("app/views/View.js");
class NodeView extends View {
    static nodesById:{[i:string]:NodeView} = {};
    modelType:typeof OutlineNodeModel;
    header:NodeHeaderView;
    children:OutlineListView;
    // parentView:ListView;
    value:OutlineNodeModel;
    isCollapsed:boolean;
    position:PositionI;
    dimensions:Dimensions;
    isFirst:boolean;
    isLast:boolean;
    isLeaf:boolean;
    readOnly:boolean;
    isBreadcrumb:boolean;

    public static refreshPositions() {
        var items = NodeView.nodesById;
        var nid:string;
        for (nid in items) {
            var item:NodeView = items[nid];
            if (item.nodeRootView == null) {continue;}
            var header = item.header;
            item.dimensions = {
                width: $(header.elem).outerWidth(),
                height: $(header.elem).outerHeight()
            };
            var p:{top?:number;left?:number} = header.getOffset();
            item.position = {
                left: p.left,
                top: p.top
            };
        }
        return this;
    }

    getLastChild():NodeView {
        var childlist = this.children.listItems;
        if (childlist.count === 0) {return this;}
        else {
            return NodeView.nodesById[childlist.last()].getLastChild();
        }
    }

    nextVisibleNode(skipchildren?:boolean) {
        if (skipchildren === undefined) {skipchildren = false;}
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
            return null; // this is last in the visible list
        }
    }

    prevVisibleNode() {
        assert(this.parentView.listItems != null, "nextVisibleNode called on invalid node");
        var nid = this.parentView.listItems.prev[this.id];
        if (nid !== '') {
            return NodeView.nodesById[nid].getLastChild();
        } else if (this.parentView.nodeView != null) {
            return this.parentView.nodeView;
        } else {
            return null; // this is first in the visible list
        }
    }

    init() {
        this.modelType = OutlineNodeModel;
        this.childViewTypes = {
            header: NodeHeaderView,
            children: OutlineListView
        };
        NodeView.nodesById[this.id] = this;
    }

    destroy(opts?) {
        delete NodeView.nodesById[this.id];
        var boxes:DropBox[] = this.dropboxes;
        var i:number;
        if (boxes && boxes.length) {
            for (i = 0; i < boxes.length; ++i) {
                boxes[i].remove();
            }
        }
        this.dropboxes = [];
        super.destroy(opts);
    }

    removeFromModel() {
        if (this.nodeRootView) { // won't be set for helper
            this.value.clearView(this.nodeRootView); // remove view from model-outline
        }
    }

    updateValue() {
        if (this.nodeRootView == null) { // node is detached from root
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
        if (this.parentView.searchList!=null) {
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
    }

    render() {
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
        while (this.value && this.value.attributes.backLinks && (this.value.attributes.backLinks.count>this.header.linkcount.numLinks)) {
            this.header.linkcount.addLink();
        }
        for (var name in this.childViewTypes) {
            this.elem.appendChild((<View>(this[name])).elem);
        }
        if (this.isCollapsed) {
            this.isLeaf = false;
            this.addClass('branch').removeClass('leaf').
                addClass('collapsed').removeClass('expanded');
        } else {
            if (this.children.elem.children.length > 0) {
                // this is defined because rendering is bottom-up
                this.isLeaf = false;
                this.addClass('branch').removeClass('leaf').
                    addClass('expanded').removeClass('collapsed');
            } else {
                this.isLeaf = true;
                this.addClass('leaf').removeClass('branch').
                    addClass('expanded').removeClass('collapsed');
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
    }

    layoutDown() {
        if (!this.layout) {this.layout = {};}
        this.layout.width = this.parentView.layout.width;
        this.layout.left = 0;
    }

    layoutUp() {
        this.layout.height = this.header.layout.height + this.children.layout.height;
    }

    positionChildren(v:View, v2?:string, validate?:boolean) {
        if (!v || (v === this.header)) {
            if (this.children) {
                var l:Layout = this.children.saveLayout();
                this.children.layoutDown();
                this.children.updateDiffs(l, validate);
            }
        }
    }

    setCollapsed(collapsed:boolean) {
        if (this.isLeaf) {collapsed = false;}
        if (this.panelView && this.panelView.browseChat) {
            collapsed = true;
        }
        if (collapsed === this.isCollapsed) {return;}
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
    }

    themeFirst(first) {
        if (first === this.isFirst) {return;}
        this.isFirst = first;
        if (first) {
            this.addClass('ui-first-child');
        } else {
            this.removeClass('ui-first-child');
        }
    }

    themeLast(last) {
        if (last === this.isLast) {return;}
        this.isLast = last;
        if (last) {
            this.addClass('ui-last-child');
        } else {
            this.removeClass('ui-last-child');
        }
    }

    themeLeaf(leaf:boolean) {
        if (leaf === this.isLeaf) {return;}
        this.isLeaf = leaf;
        if (leaf) {
            this.addClass('leaf').removeClass('branch');
        } else {
            this.addClass('branch').removeClass('leaf');
        }
        this.header.handle.renderUpdate();
    }

    validate() {
        super.validate();
        var views:{[k:string]:View} = View.viewList;
        var nodes:{[i:string]:NodeView} = NodeView.nodesById;
        var outlines:{[i:string]:OutlineRootView} = OutlineRootView.outlinesById;
        var models = OutlineNodeModel.modelsById;
        var v:string = this.id;
        var foundit:boolean = false;
        assert(views[this.id] === this, "Node " + this.id + " not in list");
        assert(this.nodeView === this, "NodeView does not identify itself as nodeView");
        assert(this.parentView.nodeView !== this, "NodeView parent cannot refer to inner nodeView");
        if (!(this instanceof ChatBoxView)) {
            assert(this.nodeRootView != null, "NodeView cannot have null nodeRootView");
        }
        assert(this.value instanceof OutlineNodeModel,
            "NodeView  " + v + " value is not a model");
        if (this.children) {
            assert(models[this.value.cid].attributes.children === this.children.value,
                "NodeView " + v + " has value-children different than children-value");
        }
        if (!(this instanceof ChatBoxView)) {
            assert(this.parentView instanceof ListView,
                "View " + v + " has type NodeView but parentView is not a ListView");
            assert(this.parentView.value instanceof OutlineNodeCollection,
                "NodeView " + v + " parent view does not have value OutlineNodeCollection");
            assert((<OutlineNodeCollection>this.parentView.value).obj[this.value.cid] === models[this.value.cid],
                "NodeView " + v + " parent view's collection does not include item's model ID " + this.value.cid);
            assert(this.value.views[this.nodeRootView.id] === this,
                "View " + v + " has a model without corresponding view under nodeRootView " + this.nodeRootView.id);
            if (this.value.attributes.parent != OutlineNodeModel.root) {
                if (outlines[this.parentView.id] != null) { // parent-list is outline-root
                } else { // parent list is inside of another list
                    assert(this.parentView.nodeView != null,
                        "NodeView " + v + " does not have a valid parent's parent though it is not the outline-root");
                    assert(this.parentView.nodeView instanceof NodeView,
                        "NodeView " + v + " does not have a parent's parent that is also a NodeView, nor is it the outline-root");
                    assert(models[this.parentView.nodeView.value.cid] === this.value.attributes.parent,
                        "NodeView " + v + " has a parent NodeView with model id " + this.parentView.nodeView.value.cid +
                            " which does not match model-parent");
                }
            } else {
                assert(outlines[this.parentView.id] != null,
                    "View " + v + " has root-model but is not an outline root");
            }
            if (this.isCollapsed) {
                assert($(this.elem).hasClass('collapsed'), "List item " + this.id + " does not have collapsed class");
                assert(!$(this.elem).hasClass('expanded'), "List item " + this.id + " has expanded class");
            } else {
                assert(!$(this.elem).hasClass('collapsed'), "List item " + this.id + " has collapsed class");
                assert($(this.elem).hasClass('expanded'), "List item " + this.id + " does not have collapsed class");
            }
        }
    }
}

