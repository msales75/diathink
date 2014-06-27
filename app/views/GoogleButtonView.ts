///<reference path="View.ts"/>
m_require("app/views/ButtonView.js");
class GoogleButtonView extends ButtonView {
    parentView:SocialBoxView;
    value:string = 'theme/images/gplus.png';
    init() {
        this.isClickable = true;
    }
    onClick(params:DragStartI) {
        if (this.isEnabled) {
            this.start();
        }
        // window.open('http://facebook.com/sharer.php?u='+encodeURIComponent(location.href));
    }
    layoutDown() {
        this.layout = {
            top: 0,
            left: 48,
            width: 22,
            height: 22
        };
    }
}

