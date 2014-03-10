var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/View.js");
var ContainerView = (function (_super) {
    __extends(ContainerView, _super);
    function ContainerView() {
        _super.apply(this, arguments);
    }
    ContainerView.prototype.render = function () {
        this._create({
            type: 'div',
            classes: this.cssClass
        });
        this.renderChildViews();
        for (var name in this.childViewTypes) {
            this.elem.appendChild((this[name]).elem);
        }
        return this.elem;
    };
    return ContainerView;
})(View);
//# sourceMappingURL=ContainerView.js.map
