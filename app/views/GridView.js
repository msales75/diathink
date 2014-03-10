var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/View.js");
var TWO_COLUMNS = {
    cssClass: 'ui-grid-a',
    columns: {
        scroll1: 'ui-block-a',
        scroll2: 'ui-block-b'
    }
};
var THREE_COLUMNS = {
    cssClass: 'ui-grid-b',
    columns: {
        scroll1: 'ui-block-a',
        scroll2: 'ui-block-b',
        scroll3: 'ui-block-c'
    }
};
var FOUR_COLUMNS = {
    cssClass: 'ui-grid-c',
    columns: {
        scroll1: 'ui-block-a',
        scroll2: 'ui-block-b',
        scroll3: 'ui-block-c',
        scroll4: 'ui-block-d'
    }
};
var GridView = (function (_super) {
    __extends(GridView, _super);
    function GridView() {
        _super.apply(this, arguments);
    }
    GridView.prototype.render = function () {
        var i, html = '';
        assert(this.layout != null, 'No layout specified for GridView (' + this.id + ')!');
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
    };
    return GridView;
})(View);
//# sourceMappingURL=GridView.js.map
