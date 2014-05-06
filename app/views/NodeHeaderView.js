var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

var NodeHeaderView = (function (_super) {
    __extends(NodeHeaderView, _super);
    function NodeHeaderView() {
        _super.apply(this, arguments);
        this.cssClass = 'outline-header';
    }
    NodeHeaderView.prototype.init = function () {
        this.childViewTypes = {
            handle: HandleImageView,
            name: NodeTextWrapperView
        };
    };
    return NodeHeaderView;
})(ContainerView);
//# sourceMappingURL=NodeHeaderView.js.map
