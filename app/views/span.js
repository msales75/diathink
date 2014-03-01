var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../foundation/view.ts"/>
m_require("app/foundation/view.js");

var SpanView = (function (_super) {
    __extends(SpanView, _super);
    function SpanView() {
        _super.apply(this, arguments);
        this.type = 'SpanView';
    }
    SpanView.prototype.render = function () {
        this.computeValue();
        this.html = '';
        this.html += '<span id="' + this.id + '"' + this.style() + '>' + (this.value ? this.value : '') + '</span>';
        return this.html;
    };

    SpanView.prototype.style = function () {
        var html = '';
        if (this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        return html;
    };
    return SpanView;
})(View);
//# sourceMappingURL=span.js.map
