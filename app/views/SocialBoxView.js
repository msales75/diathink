///<reference path="View.ts"/>
///<reference path="../events/ScrollHandler.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/views/View.js");

var SocialBoxView = (function (_super) {
    __extends(SocialBoxView, _super);
    function SocialBoxView() {
        _super.apply(this, arguments);
    }
    SocialBoxView.prototype.init = function () {
        this.childViewTypes = {
            facebookbutton: FacebookButtonView,
            twitterbutton: TwitterButtonView,
            googlebutton: GoogleButtonView
        };
    };
    SocialBoxView.prototype.updateValue = function () {
        this.value = this.parentView.value;
        if (this.parentView.isChat) {
            this.isActive = true;
        } else {
            this.isActive = false;
        }
        if (!this.isActive) {
            this.childViewTypes = {};
        } else {
            this.childViewTypes = {
                facebookbutton: FacebookButtonView,
                twitterbutton: TwitterButtonView,
                googlebutton: GoogleButtonView
            };
        }
    };
    SocialBoxView.prototype.render = function () {
        if (this.isActive) {
            // console.log("ChatBoxView, rendering with isActive=true, id="+this.id);
            return _super.prototype.render.call(this);
        } else {
            // console.log("ChatBoxView, not rendering with isActive=false, id="+this.id);
            return null;
        }
    };
    SocialBoxView.prototype.layoutDown = function () {
        var p = this.parentView.parentView.layout;
        if (!this.layout) {
            this.layout = {};
        }
        if (this.isActive) {
            this.layout.left = this.parentView.layout.width - 110;
            this.layout.top = 2;
            this.layout.width = 70;
            this.layout.height = 22;
        } else {
            this.layout.left = 0;
            this.layout.width = 0;
            this.layout.height = 0;
            this.layout.top = 0;
        }
    };
    return SocialBoxView;
})(ContainerView);
//# sourceMappingURL=SocialBoxView.js.map
