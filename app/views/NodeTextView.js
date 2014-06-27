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
    }
    NodeTextView.prototype.updateValue = function () {
        // this.setValuePatterns(this.parentView.parentView.parentView.value);
        if (this.nodeView.isBreadcrumb) {
            this.value = this.getBreadcrumbPrefix() + this.nodeView.value.get('text');
        } else {
            this.value = this.nodeView.value.get('text');
        }
    };

    NodeTextView.prototype.getBreadcrumbPrefix = function () {
        var blist = [];
        var crumb, model = this.nodeView.value;
        crumb = model;
        while (crumb != null) {
            blist.unshift(crumb);
            crumb = crumb.get('parent');
        }
        var i, html = '';
        if (blist.length > 0) {
            for (i = 0; i < blist.length - 1; ++i) {
                html += blist[i].get('text') + ' > ';
            }
        }
        return html;
    };
    return NodeTextView;
})(TextAreaView);
//# sourceMappingURL=NodeTextView.js.map
