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
        return this.elem;
    };

    ListView.prototype.collapseList = function () {
        this.hideList = true;
        this.removeListItems();
    };

    ListView.prototype.expandList = function () {
        this.hideList = false;
        this.createListItems();
        this.insertListItems();
    };

    ListView.prototype.validate = function () {
        var v = this.id;
        var k;
        var views = View.viewList;
        var models = OutlineNodeModel.modelsById;
        var foundit = false;
        assert(_.size(this.childViewTypes) === 0, "View " + v + " has type ListView but has more than zero childViewsTypes");
        assert(this.value instanceof OutlineNodeCollection, "ListView " + v + " value is not a OutlineNodeCollection");
        assert(this.listItemTemplate === NodeView, "listItemTemplate " + v + " is not NodeView");

        if (this.nodeView) {
            assert(this.nodeView.value.attributes.children === this.value, "List value does not match parent Node for id=" + this.id);
        }

        for (k in this.value.obj) {
            assert(this.value.obj[k] instanceof OutlineNodeModel, "ListView " + v + " has child-model rank " + k + " is not an OutlineNodeModel");
            assert(models[this.value.obj[k].cid] === this.value.obj[k], "ListView " + v + " child-model " + this.value.obj[k].cid + " is not in the models list");
            assert(this.value.obj[k].get('parent').get('children') === this.value, "List does not match parent child-list");
        }

        // listItems should match value exactly if expanded, or be empty of collapsed.
        if ((this.nodeView != null) && this.nodeView.isCollapsed) {
            assert(this.listItems.count === 0, "List is collapsed but listItems are not empty id=" + this.id);
            assert(this.elem.children.length === 0, "There are children in a collapsed list " + this.id);
        } else {
            // this.value[] should be same as this.listItems[].value
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
    };
    return ListView;
})(View);
//# sourceMappingURL=ListView.js.map
