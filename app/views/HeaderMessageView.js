var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/View.js");
var HeaderMessageView = (function (_super) {
    __extends(HeaderMessageView, _super);
    function HeaderMessageView() {
        _super.apply(this, arguments);
        this.value = "";
        this.type = "";
        this.isActive = false;
        this.timer = null;
    }
    HeaderMessageView.prototype.layoutDown = function () {
        this.layout = {
            top: 4,
            left: Math.round(0.3 * (this.parentView.layout.width - 110)),
            height: this.parentView.layout.height - 8,
            width: Math.round(0.6 * (this.parentView.layout.width - 110))
        };
    };
    HeaderMessageView.prototype.render = function () {
        this._create({
            type: 'div',
            classes: 'message',
            html: this.value
        });
        this.setPosition();
        return this.elem;
    };
    HeaderMessageView.prototype.renderUpdate = function () {
        this.elem.innerHTML = this.value;
        if (this.type === 'action') {
            this.removeClass('hover');
        } else if (this.type === 'hover') {
            this.addClass('hover');
        }
    };
    HeaderMessageView.prototype.setValue = function (val, type) {
        var self = this;
        if (this.isActive) {
            clearTimeout(this.timer);
            this.value = "";
            this.renderUpdate();
            this.timer = setTimeout(function () {
                self.isActive = false;
                self.setValue(val, type);
            }, 20);
        } else {
            this.isActive = true;
            this.value = val;
            this.type = type;
            this.renderUpdate();
            this.timer = setTimeout(function () {
                self.isActive = false;
                self.clearValue();
            }, 600);
        }
    };
    HeaderMessageView.prototype.clearValue = function () {
        this.value = "";
        this.timer = null;
        this.isActive = false;
        this.renderUpdate();
    };
    return HeaderMessageView;
})(View);
//# sourceMappingURL=HeaderMessageView.js.map
