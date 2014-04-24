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
        return this.elem;
    };
    GridView.prototype.renderListItems = function () {
        _super.prototype.renderListItems.call(this);
        this.updateWidths();
    };
    GridView.prototype.updateWidths = function () {
        if (this.elem) {
            var width = 100.0 / this.numCols;
            var widthS = String(Math.round(10000 * width) / 10000) + '%';
            var m;
            var children = this.listItems;
            for (m = children.first(); m !== ''; m = children.next[m]) {
                children.obj[m].elem.style.width = widthS;
            }
        }
    };
    return GridView;
})(View);
//# sourceMappingURL=GridView.js.map
