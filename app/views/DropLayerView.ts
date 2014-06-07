///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");
class DropLayerView extends ContainerView {
    parentView:OutlineScrollView;
    cacheOffset:PositionI = null;
    cssClass = 'droplayer';
    layoutDown() {
        var p:Layout = this.parentView.layout;
        if (!this.layout) {this.layout = {};}
        this.layout.top = 0;
        this.layout.left = 0;
        this.layout.width= p.width;
    }
}
