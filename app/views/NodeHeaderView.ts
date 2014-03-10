///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

class NodeHeaderView extends ContainerView {
    cssClass = 'outline-header';
    parentView:NodeView;
    handle:HandleImageView;
    name:NodeTextWrapperView;

    init() {
        this.Class = NodeHeaderView;
        this.childViewTypes = {
            handle: HandleImageView,
            name: NodeTextWrapperView
        };
    }
}
