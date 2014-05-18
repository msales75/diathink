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
    PageView.prototype.prerender = function () {
        this._create({
            type: 'div',
            classes: this.cssClass
        });

        // put hiddenview into DOM immediately.
        this.hiddendiv.render();
        this.elem.appendChild(this.hiddendiv.elem);
        this.hiddentype = this.childViewTypes['hiddendiv'];
        delete this.childViewTypes['hiddendiv'];

        // this.elem.setAttribute('data-role', 'page');
        (document.documentElement).className = 'ui-mobile landscape';
        document.body.className = 'ui-mobile-viewport ui-overlay-c';
        document.body.appendChild(this.elem);
    };
    PageView.prototype.render = function () {
        this.renderChildViews();
        this.setPosition();
        for (var name in this.childViewTypes) {
            this.elem.appendChild((this[name]).elem);
        }

        // restore hiddendiv type
        this.childViewTypes['hiddendiv'] = this.hiddentype;
        this.hiddentype = null;
        return this.elem;
    };
    return PageView;
})(View);
//# sourceMappingURL=PageView.js.map
