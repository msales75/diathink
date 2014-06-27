///<reference path="View.ts"/>
m_require("app/views/ButtonView.js");
class FacebookButtonView extends ButtonView {
    parentView:SocialBoxView;
    value:string = 'theme/images/facebook.png';
    init() {
        this.isClickable = true;
    }
    onClick(params:DragStartI) {
        if (this.isEnabled) {
            this.start();
        }
        window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent('http://diaclear.net/share4.html'),
        "Invite Friends", 'height=400,width=600');
    }
    layoutDown() {
        this.layout = {
            top: 0,
            left: 0,
            width: 23,
            height: 22
        };
    }
}

