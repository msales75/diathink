var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../foundation/view.ts"/>
m_require("app/foundation/view.js");

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
        this.type = 'GridView';
    }
    GridView.prototype.render = function () {
        this.html = '<div id="' + this.id + '" ' + this.style() + '>';
        this.renderChildViews();
        this.html += '</div>';
        return this.html;
    };

    GridView.prototype.renderChildViews = function () {
        if (this.layout) {
            for (var i in this.layout.columns) {
                var child = this[i];
                if (child) {
                    this.html += '<div class="' + this.layout.columns[i] + '">';
                    child._name = i;
                    this.html += child.render();
                    this.html += '</div>';
                    child.parentView = this;
                }
            }
        } else {
            M.Logger.log('No layout specified for GridView (' + this.id + ')!', M.WARN);
        }
        return this.html;
    };

    GridView.prototype.theme = function () {
        this.themeChildViews(null);
    };

    GridView.prototype.style = function () {
        if (this.layout) {
            var html = 'class="' + this.layout.cssClass + ' ' + this.cssClass + '"';
            return html;
        }
        return '';
    };
    return GridView;
})(View);
//# sourceMappingURL=grid.js.map
