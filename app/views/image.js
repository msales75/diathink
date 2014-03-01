var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../foundation/view.ts"/>
m_require("app/foundation/view.js");

var ImageView = (function (_super) {
    __extends(ImageView, _super);
    function ImageView() {
        _super.apply(this, arguments);
        this.type = 'ImageView';
    }
    ImageView.prototype.render = function () {
        this.computeValue();
        this.html = '<img id="' + this.id + '" src="' + (this.value && typeof (this.value) === 'string' ? this.value : '') + '"' + this.style() + ' />';
        return this.html;
    };

    ImageView.prototype.renderUpdate = function () {
        this.computeValue();
        $('#' + this.id).attr('src', this.value);
    };

    ImageView.prototype.theme = function () {
    };

    ImageView.prototype.style = function () {
        var html = '';
        if (this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        return html;
    };

    ImageView.prototype.sourceIsInvalid = function (id, event, nextEvent) {
        M.Logger.log('The source \'' + this.value + '\' is invalid, so we hide the image!', M.WARN);
        $('#' + this.id).addClass('tmp-image-hidden');
    };

    ImageView.prototype.sourceIsValid = function (id, event, nextEvent) {
        $('#' + this.id).removeClass('tmp-image-hidden');
    };
    return ImageView;
})(View);
//# sourceMappingURL=image.js.map
