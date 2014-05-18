var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

var HiddenDivView = (function (_super) {
    __extends(HiddenDivView, _super);
    function HiddenDivView() {
        _super.apply(this, arguments);
        this.cssClass = 'hiddendiv';
    }
    HiddenDivView.prototype.layoutDown = function () {
        this.layout = {
            top: 10,
            left: 10
        };
    };
    return HiddenDivView;
})(ContainerView);
//# sourceMappingURL=HiddenDivView.js.map
