var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../foundation/view.ts"/>
m_require("app/foundation/view.js");

var PageView = (function (_super) {
    __extends(PageView, _super);
    function PageView() {
        _super.apply(this, arguments);
        this.type = 'PageView';
    }
    PageView.prototype.postRender = function () {
    };
    PageView.prototype.render = function () {
        this.html = '<div id="' + this.id + '" data-role="page"' + this.style() + '>';
        this.renderChildViews();
        this.html += '</div>';
        this.writeToDOM();
        this.theme();
        this.postRender();
        return this.html;
    };
    PageView.prototype.writeToDOM = function () {
        var html = $('html');
        html.addClass('ui-mobile landscape');
        var body = $('body');
        body.addClass('ui-mobile-viewport ui-overlay-c');
        body.append(this.html);
    };
    PageView.prototype.theme = function () {
        this.themeChildViews(null);
    };
    PageView.prototype.style = function () {
        var html = '';
        if (this.cssClass) {
            if (!html) {
                html += ' class="';
            }
            html += this.cssClass;
        }
        if (html) {
            html += '"';
        }
        return html;
    };
    return PageView;
})(View);
//# sourceMappingURL=page.js.map
