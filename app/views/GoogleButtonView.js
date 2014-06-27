var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ButtonView.js");
var GoogleButtonView = (function (_super) {
    __extends(GoogleButtonView, _super);
    function GoogleButtonView() {
        _super.apply(this, arguments);
        this.value = 'theme/images/gplus.png';
    }
    GoogleButtonView.prototype.init = function () {
        this.isClickable = true;
    };
    GoogleButtonView.prototype.onClick = function (params) {
        if (this.isEnabled) {
            this.start();
        }
        // window.open('http://facebook.com/sharer.php?u='+encodeURIComponent(location.href));
    };
    GoogleButtonView.prototype.layoutDown = function () {
        this.layout = {
            top: 0,
            left: 48,
            width: 22,
            height: 22
        };
    };
    return GoogleButtonView;
})(ButtonView);
//# sourceMappingURL=GoogleButtonView.js.map
