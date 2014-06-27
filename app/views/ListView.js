var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/View.js");
var ListView = (function (_super) {
    __extends(ListView, _super);
    function ListView() {
        _super.apply(this, arguments);
    }
    ListView.prototype.render = function () {
        var classes = 'ui-listview ui-listview-inset ui-corner-all ui-shadow ui-listview-c ' + (this.cssClass ? this.cssClass : '');
        assert(this.elem == null, "Rendering a list that already exists");
        this._create({
            type: 'ul',
            classes: classes
        });
        this.insertListItems();
        this.setPosition();
        return this.elem;
    };
    ListView.prototype.positionChildren = function (v, v2, validate) {
        var c = this.listItems.first();
        var end;
        var h = 0;
        if (v != null) {
            h = v.layout.top + v.layout.height;
            c = this.listItems.next[v.id];
            //console.log('positionChildren 1');
        } else {
            //console.log('positionChildren 2');
        }
        if (v2 != null) {
            end = this.listItems.next[v2];
            assert(end !== undefined, "Invalid v2 to positionChildren");
            //console.log('positionChildren 3');
        } else {
            end = '';
            //console.log('positionChildren 4');
        }
        for (; c !== end; c = this.listItems.next[c]) {
            var child = this.listItems.obj[c];
            if (!child.layout) {
                //console.log('positionChildren 5'); // todo: never tested
                child.layout = {};
            }
            var oldTop = child.layout.top;
            if (oldTop !== h) {
                if (validate) {
                    assert(false, "List item has wrong top");
                }
                child.layout.top = h;
                if (child.elem) {
                    $(child.elem).css('top', h + 'px');
                    //console.log('positionChildren 6');
                } else {
                    //console.log('positionChildren 7'); // todo: never tested without rendered
                }
            } else {
                //console.log('positionChildren 8');
            }
            h += child.layout.height;
        }
    };
    ListView.prototype.layoutUp = function () {
        var i;
        var h = 0;
        if (this.listItems) {
            for (i in this.listItems.obj) {
                h += this.listItems.obj[i].layout.height;
            }
        }
        this.layout.height = h;
    };

    ListView.prototype.collapseList = function () {
        this.hideList = true;
        this.removeListItems();
        this.resizeUp();
    };

    ListView.prototype.expandList = function () {
        this.hideList = false;
        this.createListItems();
        this.insertListItems();
        this.resizeUp();
    };

    ListView.prototype.insertAfter = function (prevNode, node) {
        var previd;
        assert(node !== null, "No panel given to insert");
        assert(this.listItems.next[node.id] === undefined, "node is already in view-list");
        if (prevNode == null) {
            if (this.listItems.count === 0) {
                previd = '';
            } else {
                previd = this.listItems.prev[this.listItems.first()];
            }
        } else {
            previd = prevNode.id;
            assert(this.listItems.obj[previd] instanceof NodeView, "insertAfter has unknown previous id");
        }
        this.listItems.insertAfter(node.id, node, previd);
        if (this.elem) {
            var nextNode = this.listItems.next[node.id];
            if (!node.elem) {
                node.render();
            } else {
                node.setPosition();
            }
            if (nextNode === '') {
                this.elem.appendChild(node.elem);
            } else {
                this.elem.insertBefore(node.elem, this.listItems.obj[nextNode].elem);
            }
            node.resizeUp();
        }

        // fix up the classes
        var isFirst = (this.listItems.prev[node.id] === '');
        var isLast = (this.listItems.next[node.id] === '');
        node.themeFirst(isFirst);
        node.themeLast(isLast);
        if (isFirst && !isLast) {
            this.listItems.obj[this.listItems.next[node.id]].themeFirst(false);
        }
        if (isLast && !isFirst) {
            this.listItems.obj[this.listItems.prev[node.id]].themeLast(false);
        }
        if (isFirst && isLast) {
            if (this.nodeView != null) {
                this.nodeView.themeLeaf(false);
            }
        }
        // node.setCollapsed();
        // node.setLeaf(true);
    };
    ListView.prototype.append = function (node) {
        return this.insertAfter(this.listItems.obj[this.listItems.last()], node);
    };
    ListView.prototype.prepend = function (node) {
        return this.insertAfter(null, node);
    };
    ListView.prototype.detach = function (node, opts) {
        var previd = this.listItems.prev[node.id];
        var nextid = this.listItems.next[node.id];
        this.listItems.remove(node.id);

        /*
        if (r.activeLineElem[outline.id] && r.activeLineElem[outline.id].id === activeNodeView.id) {
        elem = $(r.activeLineElem[outline.id]);
        r.activeLineElem[outline.id] = undefined;
        } else {
        elem = $('#'+activeNodeView.id).detach();
        }
        */
        if (node.elem && node.elem.parentNode) {
            node.elem.parentNode.removeChild(node.elem);
        }
        if (!opts || !opts.destroyList) {
            this.resizeUp();
            if ((previd === '') && (nextid !== '')) {
                this.listItems.obj[nextid].themeFirst(true);
            } else if ((nextid === '') && (previd !== '')) {
                this.listItems.obj[previd].themeLast(true);
            } else if ((nextid === '') && (previd === '')) {
                if ((this.nodeView != null) && (this.nodeView.elem != null)) {
                    this.nodeView.themeLeaf(true);
                    this.nodeView.setCollapsed(false);
                }
            }
        }
    };

    ListView.prototype.validate = function () {
        var v = this.id;
        var k;
        var views = View.viewList;
        var models = OutlineNodeModel.modelsById;
        var foundit = false;
        assert(_.size(this.childViewTypes) === 0, "View " + v + " has type ListView but has more than zero childViewsTypes");
        if (this.searchList == null) {
            assert(this.value instanceof OutlineNodeCollection, "ListView " + v + " value is not a OutlineNodeCollection");

            for (k in this.value.obj) {
                assert(this.value.obj[k] instanceof OutlineNodeModel, "ListView " + v + " has child-model rank " + k + " is not an OutlineNodeModel");
                assert(models[this.value.obj[k].cid] === this.value.obj[k], "ListView " + v + " child-model " + this.value.obj[k].cid + " is not in the models list");
                assert(this.value.obj[k].get('parent').get('children') === this.value, "List does not match parent child-list");
            }
        } else {
            assert(this.value == null, "Cannot have list-value and searchList");
        }
        assert(this.listItemTemplate === NodeView, "listItemTemplate " + v + " is not NodeView");

        if (this.nodeView) {
            assert(this.nodeView.value.attributes.children === this.value, "List value does not match parent Node for id=" + this.id);
        }

        // listItems should match value exactly if expanded, or be empty of collapsed.
        if ((this.nodeView != null) && this.nodeView.isCollapsed) {
            assert(this.listItems.count === 0, "List is collapsed but listItems are not empty id=" + this.id);
            assert(this.elem.children.length === 0, "There are children in a collapsed list " + this.id);
        } else {
            // this.value[] should be same as this.listItems[].value
            if (this.searchList == null) {
                assert(this.value.count === this.listItems.count, "value count doesn't match listItem count for listview " + this.id);
                for (k = this.listItems.first(); k !== ''; k = this.listItems.next[k]) {
                    var mid = views[k].value.cid;
                    assert(this.value.obj[mid] === this.listItems.obj[k].value, "listItems does not match value for id=" + this.id);
                    var k2 = this.listItems.next[k];
                    if (k2 !== '') {
                        var mid2 = this.value.next[mid];
                        assert(this.value.obj[mid2] === this.listItems.obj[k2].value, "listItems does not match value for id=" + this.id);
                    }
                }
            }
        }
    };
    return ListView;
})(View);
//# sourceMappingURL=ListView.js.map
