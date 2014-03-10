var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/View.js");
var PageView = (function (_super) {
    __extends(PageView, _super);
    function PageView() {
        _super.apply(this, arguments);
    }
    PageView.prototype.postRender = function () {
    };

    PageView.prototype.render = function () {
        this._create({
            type: 'div',
            classes: this.cssClass
        });
        this.elem.setAttribute('data-role', 'page');
        this.renderChildViews();
        (document.documentElement).className = 'ui-mobile landscape';
        document.body.className = 'ui-mobile-viewport ui-overlay-c';
        document.body.appendChild(this.elem);
        for (var name in this.childViewTypes) {
            this.elem.appendChild((this[name]).elem);
        }
        this.postRender();
        return this.elem;
    };
    return PageView;
})(View);
//# sourceMappingURL=PageView.js.map
