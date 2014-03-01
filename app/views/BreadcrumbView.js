var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../foundation/view.ts"/>
///<reference path="../views/PanelOutlineView.ts"/>
m_require("app/foundation/view.js");

var BreadcrumbView = (function (_super) {
    __extends(BreadcrumbView, _super);
    function BreadcrumbView() {
        _super.apply(this, arguments);
        this.type = 'BreadcrumbView';
    }
    BreadcrumbView.prototype.onDesign = function () {
        // todo: PanelOutlineView must have value defined to do this?
        if (this.parentView) {
            this.defineFromModel(this.parentView.value);
        }
    };

    BreadcrumbView.prototype.defineFromModel = function (model) {
        var crumb;
        this.value = [];
        if (model != null) {
            crumb = model;
            while (crumb != null) {
                this.value.unshift(crumb);
                crumb = crumb.get('parent');
            }
        }
    };

    BreadcrumbView.prototype.render = function () {
        var i;
        this.html = '<span id="' + this.id + '"' + this.style() + '>';
        this.html += '<a data-href="home">Home</a> &gt;&gt;';
        if (this.value.length > 0) {
            for (i = 0; i < this.value.length - 1; ++i) {
                // todo: secure displayed text
                this.html += '<a data-href="' + this.value[i].cid + '">' + this.value[i].get('text') + '</a> &gt;&gt;';
            }
            this.html += ' <strong>' + this.value[i].get('text') + '</strong>';
        }
        this.html += '</span>';
        return this.html;
    };

    BreadcrumbView.prototype.renderUpdate = function () {
        var i, html = '';
        html += '<a data-href="home">Home</a> &gt;&gt;';
        if (this.value.length > 0) {
            for (i = 0; i < this.value.length - 1; ++i) {
                // todo: secure displayed text
                html += '<a data-href="' + this.value[i].cid + '">' + this.value[i].get('text') + '</a> &gt;&gt;';
            }
            html += ' <strong>' + this.value[i].get('text') + '</strong>';
        }
        $('#' + this.id).html(html);
    };

    BreadcrumbView.prototype.theme = function () {
        $('#' + this.id).addClass('ui-breadcrumb').children('a').addClass('ui-breadcrumb-link').addClass('ui-link');
    };

    BreadcrumbView.prototype.style = function () {
        var html = '';
        if (this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        return html;
    };
    return BreadcrumbView;
})(View);
//# sourceMappingURL=BreadcrumbView.js.map
