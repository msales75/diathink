var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/View.js");
var GridView = (function (_super) {
    __extends(GridView, _super);
    function GridView() {
        _super.apply(this, arguments);
    }
    GridView.prototype.render = function () {
        this._create({
            type: 'div',
            classes: this.cssClass,
            html: ''
        });
        this.insertListItems();
        this.setPosition();
        return this.elem;
    };

    GridView.prototype.positionChildren = function (v) {
        this.itemWidth = Math.floor(this.parentView.layout.width / this.numCols);
        var c = this.listItems.first();
        var w = 0;
        if (v != null) {
            w = v.layout.left + v.layout.width;
            c = this.listItems.next[v.id];
        }
        for (; c !== ''; c = this.listItems.next[c]) {
            var child = this.listItems.obj[c];
            if (!child.layout) {
                child.layout = {};
            }
            if (child.layout.left !== w) {
                child.layout.left = w;
                if (child.elem) {
                    $(child.elem).css('left', w + 'px');
                }
            }
            w += child.layout.width;
        }
    };
    return GridView;
})(View);
//# sourceMappingURL=GridView.js.map
