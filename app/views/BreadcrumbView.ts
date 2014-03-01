///<reference path="../foundation/view.ts"/>
///<reference path="../views/PanelOutlineView.ts"/>
m_require("app/foundation/view.js");



class BreadcrumbView extends View {

    type = 'BreadcrumbView';

    onDesign() {
        // todo: PanelOutlineView must have value defined to do this?
        if (this.parentView) {
            this.defineFromModel((<PanelOutlineView>this.parentView).value);
        }
    }

    defineFromModel(model) {
        var crumb;
        this.value = [];
        if (model != null) {
            crumb = model;
            while (crumb != null) {
                this.value.unshift(crumb);
                crumb = crumb.get('parent');
            }
        }
    }

    render() {
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
        return this.html
    }

    renderUpdate() {
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
    }


    theme() {
        $('#' + this.id).addClass('ui-breadcrumb')
            .children('a').addClass('ui-breadcrumb-link').addClass('ui-link');
    }

    style() {
        var html = '';
        if (this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        return html;
    }

}
