///<reference path="View.ts"/>
m_require("app/views/TextAreaView.js");
class NodeTextView extends TextAreaView {
    parentView:NodeTextWrapperView;

    updateValue() {
        // this.setValuePatterns(this.parentView.parentView.parentView.value);
        if (this.nodeView.isBreadcrumb) {
            this.value = this.getBreadcrumbPrefix() + this.nodeView.value.get('text');
        } else {
            this.value = this.nodeView.value.get('text');
        }
    }

    getBreadcrumbPrefix() {
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
    }

    cssClass = 'outline-content ui-input-text ui-body-c ui-corner-all ui-shadow-inset';
}

