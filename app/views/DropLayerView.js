var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");
var DropLayerView = (function (_super) {
    __extends(DropLayerView, _super);
    function DropLayerView() {
        _super.apply(this, arguments);
        this.cssClass = 'droplayer';
    }
    DropLayerView.prototype.init = function () {
        this.Class = DropLayerView;
    };
    return DropLayerView;
})(ContainerView);
//# sourceMappingURL=DropLayerView.js.map
