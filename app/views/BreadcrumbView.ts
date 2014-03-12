///<reference path="View.ts"/>
m_require("app/views/View.js");
class BreadcrumbView extends View {
    parentView:PanelView;

    init() {
        this.Class = BreadcrumbView;
        this.isClickable = true;
    }

    updateValue() {
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
    }

    getInnerHTML() {
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
    }

    render() {
        this._create({type: 'span', classes: 'ui-breadcrumb', html: this.getInnerHTML()});
        return this.elem;
    }

    renderUpdate() {
        this.elem.innerHTML = this.getInnerHTML();
    }

    onClick() {
    }

}
