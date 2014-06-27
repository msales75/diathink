///<reference path="View.ts"/>
///<reference path="../events/ScrollHandler.ts"/>

m_require("app/views/View.js");

class SocialBoxView extends ContainerView {
    parentView:PanelView;
    facebookbutton: FacebookButtonView;
    twitterbutton: TwitterButtonView;
    googlebutton: GoogleButtonView;
    isActive:boolean;
    init() {
        this.childViewTypes = {
            facebookbutton: FacebookButtonView,
            twitterbutton: TwitterButtonView,
            googlebutton: GoogleButtonView
        };
    }
    updateValue() {
        this.value = this.parentView.value;
        if (this.parentView.isChat) {
            this.isActive = true;
        } else {
            this.isActive = false;
        }
        if (! this.isActive) {
            this.childViewTypes = {};
        } else {
            this.childViewTypes = {
                facebookbutton: FacebookButtonView,
                twitterbutton: TwitterButtonView,
                googlebutton: GoogleButtonView
            };
        }
    }
    render() {
        if (this.isActive) {
            // console.log("ChatBoxView, rendering with isActive=true, id="+this.id);
            return super.render();
        } else {
            // console.log("ChatBoxView, not rendering with isActive=false, id="+this.id);
            return null;
        }
    }
    layoutDown() {
        var p = this.parentView.parentView.layout;
        if (!this.layout) {this.layout = {};}
        if (this.isActive) {
            this.layout.left = this.parentView.layout.width-110;
            this.layout.top = 2;
            this.layout.width = 70;
            this.layout.height = 22;
        } else {
            this.layout.left = 0;
            this.layout.width = 0;
            this.layout.height = 0;
            this.layout.top = 0;
        }
    }
}