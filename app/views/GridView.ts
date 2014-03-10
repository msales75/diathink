///<reference path="View.ts"/>
m_require("app/views/View.js");
var TWO_COLUMNS:GridLayout = {
    cssClass: 'ui-grid-a',
    columns: {
        scroll1: 'ui-block-a',
        scroll2: 'ui-block-b'
    }
};
var THREE_COLUMNS:GridLayout = {
    cssClass: 'ui-grid-b',
    columns: {
        scroll1: 'ui-block-a',
        scroll2: 'ui-block-b',
        scroll3: 'ui-block-c'
    }
};
var FOUR_COLUMNS:GridLayout = {
    cssClass: 'ui-grid-c',
    columns: {
        scroll1: 'ui-block-a',
        scroll2: 'ui-block-b',
        scroll3: 'ui-block-c',
        scroll4: 'ui-block-d'
    }
};
class GridView extends View {
    layout:GridLayout;

    render() {
        var i, html = '';
        assert(this.layout != null,
            'No layout specified for GridView (' + this.id + ')!');
        for (i in this.layout.columns) {
            html += '<div class="' + this.layout.columns[i] + '"></div>';
        }
        this._create({
            type: 'div',
            classes: this.layout.cssClass + ' ' + this.cssClass,
            html: html
        });
        this.renderChildViews();
        var n = 0;
        for (i in this.layout.columns) {
            this.elem.children[n].appendChild(this[i].elem);
            ++n;
        }
        return this.elem;
    }
}
