///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

class DrawLayerView extends ContainerView {
    parentView:DiathinkView;
    cacheOffset:PositionI = null;
    cssClass = 'drawlayer';
    layoutDown() {
        var p:Layout = this.parentView.layout;
        this.layout = {
            top: p.top,
            left: p.left,
            width: p.width,
            height: p.height
        }
    }
}

