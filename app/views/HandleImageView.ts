///<reference path="View.ts"/>
m_require("app/views/ImageView.js");
class HandleImageView extends ImageView {
    init() {
        this.Class = HandleImageView;
    }
    value = 'theme/images/drag_icon.png';
    cssClass = 'drag-handle disclose ui-disable-scroll';
}
