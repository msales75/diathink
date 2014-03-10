var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/View.js");
var BreadcrumbView = (function (_super) {
    __extends(BreadcrumbView, _super);
    function BreadcrumbView() {
        _super.apply(this, arguments);
    }
    BreadcrumbView.prototype.init = function () {
        this.Class = BreadcrumbView;
    };

    BreadcrumbView.prototype.updateValue = function () {
        if (this.parentView) {
            var crumb, model = this.parentView.value;
            this.value = [];
            if (model != null) {
                crumb = model;
                while (crumb != null) {
                    this.value.unshift(crumb);
                    crumb = crumb.get('parent');
                }
            }
        }
    };

    BreadcrumbView.prototype.getInnerHTML = function () {
        var i, html = '';
        html += '<a class="ui-breadcrumb-link ui-link" data-href="home">Home</a> &gt;&gt;';
        if (this.value.length > 0) {
            for (i = 0; i < this.value.length - 1; ++i) {
                // todo: secure displayed text
                html += '<a class="ui-breadcrumb-link ui-link" data-href="' + this.value[i].cid + '">' + this.value[i].get('text') + '</a> &gt;&gt;';
            }
            html += ' <strong>' + this.value[i].get('text') + '</strong>';
        }
        return html;
    };

    BreadcrumbView.prototype.render = function () {
        this._create({ type: 'span', classes: 'ui-breadcrumb', html: this.getInnerHTML() });
        return this.elem;
    };

    BreadcrumbView.prototype.renderUpdate = function () {
        this.elem.innerHTML = this.getInnerHTML();
    };
    return BreadcrumbView;
})(View);
//# sourceMappingURL=BreadcrumbView.js.map
