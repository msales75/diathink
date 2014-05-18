var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/View.js");

var ImageView = (function (_super) {
    __extends(ImageView, _super);
    function ImageView() {
        _super.apply(this, arguments);
    }
    ImageView.prototype.render = function () {
        this._create({
            type: 'img',
            classes: this.cssClass
        });
        this.elem.src = (this.value && typeof (this.value) === 'string' ? this.value : '');
        this.setPosition();
        return this.elem;
    };

    ImageView.prototype.renderUpdate = function () {
        this.elem.src = this.value;
    };

    ImageView.prototype.sourceIsInvalid = function (id, event, nextEvent) {
        this.addClass('tmp-image-hidden');
    };

    ImageView.prototype.sourceIsValid = function (id, event, nextEvent) {
        this.removeClass('tmp-image-hidden');
    };
    return ImageView;
})(View);
//# sourceMappingURL=ImageView.js.map
