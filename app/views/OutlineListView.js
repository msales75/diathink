var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ListView.js");

var OutlineListView = (function (_super) {
    __extends(OutlineListView, _super);
    function OutlineListView() {
        _super.apply(this, arguments);
        this.isInset = true;
        this.items = 'models';
    }
    OutlineListView.prototype.init = function () {
        this.listItemTemplate = NodeView;
        this.Class = OutlineListView;
    };
    OutlineListView.prototype.updateValue = function () {
        this.value = this.parentView.value.attributes.children;
        this.hideList = this.parentView.isCollapsed;
    };
    OutlineListView.prototype.validate = function () {
        _super.prototype.validate.call(this);
        assert(this.nodeRootView != null, "TextAreaView cannot have null nodeRootView");
    };
    return OutlineListView;
})(ListView);
//# sourceMappingURL=OutlineListView.js.map
