var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/View.js");
var ButtonView = (function (_super) {
    __extends(ButtonView, _super);
    function ButtonView() {
        _super.apply(this, arguments);
        this.isEnabled = true;
    }
    ButtonView.prototype.render = function () {
        this._create({
            type: 'a',
            classes: 'ui-btn ui-btn-up-a ui-shadow ui-btn-corner-all ui-btn-icon-notext ' + this.cssClass,
            html: '<span class="ui-btn-inner"><span class="ui-btn-text">' + this.value + '</span></span></a>'
        });
        this.elem.href = '#';
        return this.elem;
    };

    ButtonView.prototype.disable = function () {
        if (this.isEnabled) {
            var html = this.elem.innerHTML;
            html = '<div data-theme="c" class="ui-shadow ui-disabled" aria-disabled="true">' + html + '</div>';
            this.elem.innerHTML = html;
            this.isEnabled = NO;
        }
    };

    ButtonView.prototype.enable = function () {
        if (!this.isEnabled) {
            var html = (this.elem.children[0]).innerHTML;
            this.elem.innerHTML = html;
            this.isEnabled = YES;
        }
    };
    return ButtonView;
})(View);
//# sourceMappingURL=ButtonView.js.map
