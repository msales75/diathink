///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

class DrawLayerView extends ContainerView {
    cacheOffset:PositionI = null;
    init() {
        this.Class = DrawLayerView;
    }
    cssClass = 'drawlayer';
}

