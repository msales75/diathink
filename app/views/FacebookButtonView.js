var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ButtonView.js");
var FacebookButtonView = (function (_super) {
    __extends(FacebookButtonView, _super);
    function FacebookButtonView() {
        _super.apply(this, arguments);
        this.value = 'theme/images/facebook.png';
    }
    FacebookButtonView.prototype.init = function () {
        this.isClickable = true;
    };
    FacebookButtonView.prototype.onClick = function (params) {
        if (this.isEnabled) {
            this.start();
        }
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent('http://diaclear.net/share4.html'), "Invite Friends", 'height=400,width=600');
    };
    FacebookButtonView.prototype.layoutDown = function () {
        this.layout = {
            top: 0,
            left: 0,
            width: 23,
            height: 22
        };
    };
    return FacebookButtonView;
})(ButtonView);
//# sourceMappingURL=FacebookButtonView.js.map
