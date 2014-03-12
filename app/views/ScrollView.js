///<reference path="View.ts"/>
///<reference path="../events/ScrollHandler.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/views/View.js");
var ScrollView = (function (_super) {
    __extends(ScrollView, _super);
    function ScrollView() {
        _super.apply(this, arguments);
        this.scrollHandler = null;
    }
    ScrollView.prototype.render = function () {
        this._create({
            type: 'div',
            classes: this.cssClass
        });
        this.elem.setAttribute('data-role', 'content');
        this.renderChildViews();
        for (var name in this.childViewTypes) {
            this.elem.appendChild((this[name]).elem);
        }
        this.scrollHandler = new ScrollHandler({
            element: this.elem
        });
        return this.elem;
    };
    return ScrollView;
})(View);
//# sourceMappingURL=ScrollView.js.map
