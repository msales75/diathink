var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../foundation/view.ts"/>
m_require("app/foundation/view.js");

var ContainerView = (function (_super) {
    __extends(ContainerView, _super);
    function ContainerView() {
        _super.apply(this, arguments);
        this.type = 'ContainerView';
    }
    ContainerView.prototype.render = function () {
        this.html = '<div id="' + this.id + '"' + this.style() + '>';
        this.renderChildViews();
        this.html += '</div>';
        return this.html;
    };

    ContainerView.prototype.style = function () {
        var html = '';
        if (this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        return html;
    };
    return ContainerView;
})(View);
//# sourceMappingURL=container.js.map
