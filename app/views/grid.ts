///<reference path="../foundation/view.ts"/>
m_require("app/foundation/view.js");

interface Layout {cssClass:string; columns: {[i:number]:string} }

var TWO_COLUMNS : Layout = {
    cssClass: 'ui-grid-a',
    columns: {
        scroll1: 'ui-block-a',
        scroll2: 'ui-block-b'
    }
};

var THREE_COLUMNS : Layout  = {
    cssClass: 'ui-grid-b',
    columns: {
        scroll1: 'ui-block-a',
        scroll2: 'ui-block-b',
        scroll3: 'ui-block-c'
    }
};

var FOUR_COLUMNS : Layout = {
    cssClass: 'ui-grid-c',
    columns: {
        scroll1: 'ui-block-a',
        scroll2: 'ui-block-b',
        scroll3: 'ui-block-c',
        scroll4: 'ui-block-d'
    }
};

class GridView extends View
{
    type = 'GridView';
    layout:Layout;
    cssClass:string;

    render():string {
        this.html = '<div id="' + this.id + '" ' + this.style() + '>';
        this.renderChildViews();
        this.html += '</div>';
        return this.html;
    }

    renderChildViews():string {
            if(this.layout) {
                for (var i in this.layout.columns) {
                    var child:View = this[i];
                    if (child) {
                        this.html += '<div class="' + this.layout.columns[i] + '">';
                        child._name = i;
                        this.html += child.render();
                        this.html += '</div>';
                        child.parentView = <View>this;
                    }
                }
            } else {
                M.Logger.log('No layout specified for GridView (' + this.id + ')!', M.WARN);
            }
        return this.html;
    }

    theme() {
        this.themeChildViews(null);
    }

    style() {
        if(this.layout) {
            var html = 'class="' + this.layout.cssClass + ' ' + this.cssClass + '"';
            return html;
        }
        return '';
    }

}
