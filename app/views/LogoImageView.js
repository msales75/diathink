var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
///<reference path="../main.ts"/>
m_require("app/views/ButtonView.js");
var LogoImageView = (function (_super) {
    __extends(LogoImageView, _super);
    function LogoImageView() {
        _super.apply(this, arguments);
        this.value = 'theme/images/diaclear-icon-t.png';
    }
    LogoImageView.prototype.init = function () {
        this.isClickable = true;
    };
    LogoImageView.prototype.onClick = function (params) {
        saveSnapshot();
    };
    LogoImageView.prototype.layoutDown = function () {
        this.layout = {
            top: 2,
            left: 20,
            width: 56,
            height: 35
        };
    };
    return LogoImageView;
})(ButtonView);
//# sourceMappingURL=LogoImageView.js.map
