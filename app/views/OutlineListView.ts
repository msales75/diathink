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
}
