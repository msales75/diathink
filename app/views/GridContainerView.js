var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

var GridContainerView = (function (_super) {
    __extends(GridContainerView, _super);
    function GridContainerView() {
        _super.apply(this, arguments);
        this.cssClass = 'horizontal-grid-container';
    }
    GridContainerView.prototype.init = function () {
        this.childViewTypes = {
            grid: PanelGridView
        };
    };
    GridContainerView.prototype.layoutDown = function () {
        var p = this.parentView.layout;
        this.layout = {
            top: 0,
            left: Math.round(.05 * p.width),
            width: p.width - 2 * Math.round(0.05 * p.width),
            height: p.height
        };
    };
    return GridContainerView;
})(ContainerView);
//# sourceMappingURL=GridContainerView.js.map
