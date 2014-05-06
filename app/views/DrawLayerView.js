var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

var DrawLayerView = (function (_super) {
    __extends(DrawLayerView, _super);
    function DrawLayerView() {
        _super.apply(this, arguments);
        this.cacheOffset = null;
        this.cssClass = 'drawlayer';
    }
    return DrawLayerView;
})(ContainerView);
//# sourceMappingURL=DrawLayerView.js.map
