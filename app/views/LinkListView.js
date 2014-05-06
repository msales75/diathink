var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/View.js");

var LinkListView = (function (_super) {
    __extends(LinkListView, _super);
    function LinkListView() {
        _super.apply(this, arguments);
    }
    LinkListView.prototype.init = function () {
        this.listItemTemplate = NodeLinkView;
    };
    LinkListView.prototype.render = function () {
        assert(this.elem == null, "Rendering a list that already exists");
        this._create({
            type: 'div',
            classes: 'link-list'
        });
        this.insertListItems();

        // this.redraw(); // todo: does this require textarea already in DOM?
        return this.elem;
    };
    LinkListView.prototype.updateValue = function () {
        this.value = this.nodeView.value.attributes.links;
    };

    LinkListView.prototype.setOffsets = function () {
        this.nodeView.header.name.text.fixHeight();
    };
    LinkListView.prototype.redraw = function () {
        this.setOffsets();
        var l;
        for (l = this.listItems.next['']; l !== ''; l = this.listItems.next[l]) {
            var v = this.listItems.obj[l];
            if (!v.elem) {
                v.render();
                this.elem.appendChild(v.elem);
            }
        }
    };
    LinkListView.prototype.append = function (link) {
        this.value.append(link.value.cid, link.value);
        this.listItems.append(link.id, link);
        this.redraw();
    };
    LinkListView.prototype.validate = function () {
        // todo: validate that views match with hidden-obj children
    };
    return LinkListView;
})(View);
//# sourceMappingURL=LinkListView.js.map
