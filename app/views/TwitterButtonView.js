var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ButtonView.js");
var TwitterButtonView = (function (_super) {
    __extends(TwitterButtonView, _super);
    function TwitterButtonView() {
        _super.apply(this, arguments);
        this.value = 'theme/images/twitter.png';
    }
    TwitterButtonView.prototype.init = function () {
        this.isClickable = true;
    };
    TwitterButtonView.prototype.onClick = function (params) {
        if (this.isEnabled) {
            this.start();
        }
        // window.open('http://facebook.com/sharer.php?u='+encodeURIComponent(location.href));
    };
    TwitterButtonView.prototype.layoutDown = function () {
        this.layout = {
            top: 0,
            left: 24,
            width: 22,
            height: 22
        };
    };
    return TwitterButtonView;
})(ButtonView);
//# sourceMappingURL=TwitterButtonView.js.map
