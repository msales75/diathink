var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/View.js");
var SpanView = (function (_super) {
    __extends(SpanView, _super);
    function SpanView() {
        _super.apply(this, arguments);
    }
    SpanView.prototype.render = function () {
        this._create({
            type: 'span',
            classes: this.cssClass,
            html: (this.value ? this.value : '')
        });
        return this.elem;
    };
    return SpanView;
})(View);
//# sourceMappingURL=SpanView.js.map
