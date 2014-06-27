///<reference path="View.ts"/>
m_require("app/views/NodeView.js");
class ChatBoxView extends NodeView {
    isActive:boolean;
    parentView:PanelView;
    init() {
        // console.log("Initializing ChatBoxView id="+this.id);
        super.init();
    }
    updateValue() {
        this.value = OutlineNodeModel.chatbox;
        this.readOnly=false;
        if (this.parentView.value && (this.parentView.value.cid === "chatroot")) {
            this.isActive = true;
        } else {
            this.isActive = false;
        }
        // console.log("updating value ChatBoxView, isActive="+this.isActive+", this.id="+this.id);
        if (! this.isActive) {
            this.childViewTypes = {};
        } else {
            this.childViewTypes = {
                header: NodeHeaderView,
                children: OutlineListView
            };
        }
    }
    layoutUp() {
    }
    render() {
        if (this.isActive) {
            // console.log("ChatBoxView, rendering with isActive=true, id="+this.id);
            return super.render();
        } else {
            // console.log("ChatBoxView, not rendering with isActive=false, id="+this.id);
            return null;
        }
    }
    layoutDown() {
        var p = this.parentView.parentView.layout;
        if (!this.layout) {this.layout = {};}
        if (this.isActive) {
            this.layout.left = 0;
            this.layout.width = this.parentView.layout.width;
            this.layout.height = Math.round(1.25*View.fontSize) +
                2*Math.round(.3*View.fontSize);
            this.layout.top = p.height-this.layout.height;
        } else {
            this.layout.left = 0;
            this.layout.width = 0;
            this.layout.height = 0;
            this.layout.top = 0;
        }
    }
}