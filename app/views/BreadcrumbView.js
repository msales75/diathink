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
        this.isClickable = true;
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

    BreadcrumbView.prototype.onClick = function () {
    };
    BreadcrumbView.prototype.validate = function () {
        _super.prototype.validate.call(this);
        var v = this.id;
        assert(this.parentView instanceof PanelView, "Breadcrumb view " + v + " does not have paneloutlineview parent");
        assert(this.parentView.breadcrumbs === this, "Breadcrumb view " + v + " does not match parentview.breadcrumbs");
        assert(this.parentView === this.panelView, "Breadcrumb view " + v + " does not have panelView set to parent");

        // breadcrumbs
        var crumb, bvalue = [];
        crumb = this.panelView.value;
        while (crumb != null) {
            bvalue.unshift(crumb);
            crumb = crumb.get('parent');
        }

        assert(this.value.length === bvalue.length, "Breadcrumbs " + v + " does not have breadcrumbs value match length=" + bvalue.length);
        for (var i = 0; i < bvalue.length; ++i) {
            assert(this.value[i] === bvalue[i], "Breadcrumbs " + v + " does not have breadcrumbs value " + i + " match " + bvalue[i].cid);
        }
        var count = 0;
        $(this.elem).children('a').each(function () {
            assert($(this).attr('data-href') === bvalue[count].cid, "Panel " + v + " does not have breadcrumb value " + count + " match view");
            ++count;
        });
        assert(bvalue.length === count + 1, "Breadcrumbs " + v + " does not have breadcrumb count " + bvalue.length + " match view-length " + count);
    };
    return BreadcrumbView;
})(View);
//# sourceMappingURL=BreadcrumbView.js.map
