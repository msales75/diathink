var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

var NodeTextWrapperView = (function (_super) {
    __extends(NodeTextWrapperView, _super);
    function NodeTextWrapperView() {
        _super.apply(this, arguments);
        this.cssClass = 'outline-content_container';
    }
    NodeTextWrapperView.prototype.init = function () {
        this.Class = NodeTextWrapperView;
        this.childViewTypes = {
            text: NodeTextView
        };
    };
    return NodeTextWrapperView;
})(ContainerView);
//# sourceMappingURL=NodeTextWrapperView.js.map
