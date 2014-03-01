var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../foundation/view.ts"/>
m_require("app/foundation/view.js");

var ButtonView = (function (_super) {
    __extends(ButtonView, _super);
    function ButtonView() {
        _super.apply(this, arguments);
        this.type = 'ButtonView';
        this.isEnabled = true;
    }
    ButtonView.prototype.render = function () {
        this.computeValue();
        this.html = '<a id="' + this.id + '" ' + this.style() + ' href="#">';
        this.html += '<span class="ui-btn-inner"><span class="ui-btn-text">' + this.value + '</span></span>';
        this.html += '</a>';
        return this.html;
    };

    ButtonView.prototype.theme = function () {
        /* theme only if not already done */
        if (!$('#' + this.id).hasClass('ui-btn')) {
            $('#' + this.id).addClass('ui-btn ui-btn-up-a ui-shadow ui-btn-corner-all ui-btn-icon-notext');
            $('#' + this.id).children('span').addClass('ui-btn-inner');
            $('#' + this.id).children('span').children('span').addClass('ui-btn-text');
        }
    };

    ButtonView.prototype.style = function () {
        var html = '';
        if (this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        return html;
    };

    ButtonView.prototype.disable = function () {
        if (this.isEnabled) {
            var html = $('#' + this.id).html();
            html = '<div data-theme="c" class="ui-shadow ui-disabled" aria-disabled="true">' + html + '</div>';
            $('#' + this.id).html(html);
            this.isEnabled = NO;
        }
    };

    ButtonView.prototype.enable = function () {
        if (!this.isEnabled) {
            var html = $('#' + this.id + ' div').html();
            $('#' + this.id).html(html);
            this.isEnabled = YES;
        }
    };
    return ButtonView;
})(View);
//# sourceMappingURL=button.js.map
