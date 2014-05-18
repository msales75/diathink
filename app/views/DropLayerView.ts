///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");
class DropLayerView extends ContainerView {
    parentView:OutlineScrollView;
    cacheOffset:PositionI = null;
    cssClass = 'droplayer';
    layoutDown() {
        var p:Layout = this.parentView.layout;
        this.layout = {
            top: 0,
            left: 0,
            width: p.width,
            height: p.height
        };
    }

}
