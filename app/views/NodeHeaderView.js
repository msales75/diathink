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
    NodeHeaderView.prototype.layoutDown = function () {
        if (!this.layout) {
            this.layout = {};
        }
        this.layout.top = 0;
        this.layout.left = 0;
        this.layout.width = this.parentView.layout.width;
    };
    NodeHeaderView.prototype.layoutUp = function () {
        this.layout.height = this.name.layout.height;
    };
    return NodeHeaderView;
})(ContainerView);
//# sourceMappingURL=NodeHeaderView.js.map
