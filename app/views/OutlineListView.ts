///<reference path="View.ts"/>
m_require("app/views/ListView.js");

class OutlineListView extends ListView {
    isInset = true;
    items = 'models'; // for Backbone.Collection compatibility
    parentView:NodeView;
    init() {
        this.listItemTemplate = NodeView;
    }
    updateValue() {
        this.value = this.parentView.value.attributes.children;
        this.hideList = this.parentView.isCollapsed;
    }
    validate() {
        super.validate();
        assert(this.nodeRootView !=  null,"TextAreaView cannot have null nodeRootView");
    }
    layoutDown() {
        var offset = Math.round(0.8*View.fontSize);
        if (!this.layout) {this.layout = {};}
        this.layout.left = offset;
        this.layout.width = this.parentView.layout.width-offset;
        if (this.parentView && this.parentView.header.layout) {
            this.layout.top = this.parentView.header.layout.height;
        }
    }
}
