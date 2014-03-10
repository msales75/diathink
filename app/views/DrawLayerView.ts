///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

class DrawLayerView extends ContainerView {
    init() {
        this.Class = DrawLayerView;
    }
    cssClass = 'drawlayer';
}

