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

    ListView.prototype.insertListItems = function () {
        if (this.listItems && this.listItems.length) {
            this.renderListItems();
            for (var i = 0; i < this.listItems.length; ++i) {
                this.elem.appendChild(this.listItems[i].elem);
            }
            this.listItems = null; // done with temporary storage
        }
    };
    ListView.prototype.removeListItems = function () {
        var i;
        var elem = this.elem;
        while (elem.children.length > 0) {
            View.get((elem.children[0]).id).destroy();
        }
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
    return ListView;
})(View);
//# sourceMappingURL=ListView.js.map
