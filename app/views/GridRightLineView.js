var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/View.js");
var GridRightLineView = (function (_super) {
    __extends(GridRightLineView, _super);
    function GridRightLineView() {
        _super.apply(this, arguments);
    }
    GridRightLineView.prototype.render = function () {
        this._create({
            type: 'div',
            classes: 'grid-right-line'
        });
        this.setPosition();
        return this.elem;
    };
    GridRightLineView.prototype.layoutDown = function () {
        var p = this.parentView.layout;
        if (!this.layout) {
            this.layout = {};
        }
        this.layout.top = Math.round(0.03 * p.height);
        this.layout.height = Math.round(0.94 * p.height);
        this.layout.width = 1;
    };
    return GridRightLineView;
})(View);
//# sourceMappingURL=GridRightLineView.js.map
