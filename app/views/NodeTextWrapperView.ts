///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

class NodeTextWrapperView extends ContainerView {
    text:NodeTextView;
    parentView:NodeHeaderView;
    cssClass = 'outline-content_container';

    init() {
        this.Class = NodeTextWrapperView;
        this.childViewTypes = {
            text: NodeTextView
        };
    }
}
