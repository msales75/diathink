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
    GridView.prototype.resize = function () {
        if (this.elem) {
            if (this.elem.parentNode) {
                var p;
                this.itemWidth = Math.floor(Math.floor(this.parentView.elem.clientWidth - 0.5) / this.numCols);
                for (p in this.listItems.obj) {
                    $(this.listItems.obj[p].elem).css('width', String(this.itemWidth) + 'px');
                }
            } else {
                var p;
                var relativeWidth = String(Math.round(100000.0 / this.numCols) / 1000) + '%';
                for (p in this.listItems.obj) {
                    0;
                    $(this.listItems.obj[p].elem).css('width', relativeWidth);
                }
            }
        }
    };

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
        this.resize();
    };
    return GridView;
})(View);
//# sourceMappingURL=GridView.js.map
