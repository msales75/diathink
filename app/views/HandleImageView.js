var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ImageView.js");
var HandleImageView = (function (_super) {
    __extends(HandleImageView, _super);
    function HandleImageView() {
        _super.apply(this, arguments);
        this.value = 'theme/images/drag_icon.png';
        this.cssClass = 'drag-handle disclose ui-disable-scroll';
    }
    HandleImageView.prototype.init = function () {
        this.Class = HandleImageView;
    };
    return HandleImageView;
})(ImageView);
//# sourceMappingURL=HandleImageView.js.map
