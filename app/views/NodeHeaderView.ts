///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

class NodeHeaderView extends ContainerView {
    cssClass = 'outline-header';
    parentView:NodeView;
    handle:HandleImageView;
    name:NodeTextWrapperView;

    init() {
        this.childViewTypes = {
            handle: HandleImageView,
            name: NodeTextWrapperView
        };
    }
    layoutDown() {
        if (!this.layout) {this.layout = {};}
        this.layout.top = 0;
        this.layout.left = 0;
        this.layout.width = this.parentView.layout.width;
    }
    layoutUp() {
        this.layout.height = this.name.layout.height;
    }
}
