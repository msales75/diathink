var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/TextAreaView.js");

var NodeTextView = (function (_super) {
    __extends(NodeTextView, _super);
    function NodeTextView() {
        _super.apply(this, arguments);
        this.cssClass = 'outline-content ui-input-text ui-body-c ui-corner-all ui-shadow-inset';
        this.hasMultipleLines = true;
    }
    NodeTextView.prototype.init = function () {
        this.valuePattern = '<%= text %>';
        this.Class = NodeTextView;
    };
    NodeTextView.prototype.updateValue = function () {
        this.setValuePatterns(this.parentView.parentView.parentView.value);
    };
    return NodeTextView;
})(TextAreaView);
//# sourceMappingURL=NodeTextView.js.map
