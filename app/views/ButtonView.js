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
        this.isActive = false;
        this.value = 'theme/images/circle.png';
    }
    ButtonView.prototype.render = function () {
        this._create({
            type: 'div',
            classes: 'button',
            html: '<img src="' + this.value + '" alt="' + this.value + '"/>'
        });

        /*
        this._create({
        type: 'a',
        classes: 'ui-btn ui-btn-up-a ui-shadow ui-btn-corner-all ui-btn-icon-notext ' + this.cssClass,
        html: '<span class="ui-btn-inner"><span class="ui-btn-text">' + this.value + '</span></span></a>'
        });
        this.elem.href = '#';
        */
        this.setPosition();
        return this.elem;
    };
    ButtonView.prototype.start = function () {
        var self = this;
        if (this.isActive) {
            clearTimeout(this.timer);
            this.removeClass('active');
            this.timer = setTimeout(function () {
                self.isActive = false;
                self.start();
            }, 20);
        } else {
            this.isActive = true;
            this.addClass('active');
            this.timer = setTimeout(function () {
                self.isActive = false;
                self.finish();
            }, 200);
        }
    };
    ButtonView.prototype.finish = function () {
        this.timer = null;
        this.isActive = false;
        this.removeClass('active');
    };

    ButtonView.prototype.disable = function () {
        if (this.isEnabled) {
            this.addClass('disabled');

            /*
            var html = this.elem.innerHTML;
            html = '<div data-theme="c" class="ui-shadow ui-disabled" aria-disabled="true">' + html + '</div>';
            this.elem.innerHTML = html;
            */
            this.isEnabled = NO;
        }
    };

    ButtonView.prototype.enable = function () {
        if (!this.isEnabled) {
            this.removeClass('disabled');

            /*            var html = (<HTMLElement>(this.elem.children[0])).innerHTML;
            this.elem.innerHTML = html; */
            this.isEnabled = YES;
        }
    };
    ButtonView.prototype.validate = function () {
        _super.prototype.validate.call(this);
        assert(this.isEnabled === (!$(this.elem).hasClass('disabled')), "Button enabled does not match disabled-class");
        assert(this.value === $(this.elem).children('img').attr('src'), "Image button does not match value");
        assert(this.value === $(this.elem).children('img').attr('alt'), "Image button does not match alt");
    };
    return ButtonView;
})(View);
//# sourceMappingURL=ButtonView.js.map
