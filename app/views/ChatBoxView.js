var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/NodeView.js");
var ChatBoxView = (function (_super) {
    __extends(ChatBoxView, _super);
    function ChatBoxView() {
        _super.apply(this, arguments);
    }
    ChatBoxView.prototype.init = function () {
        // console.log("Initializing ChatBoxView id="+this.id);
        _super.prototype.init.call(this);
    };
    ChatBoxView.prototype.updateValue = function () {
        this.value = OutlineNodeModel.chatbox;
        this.readOnly = false;
        if (this.parentView.value && (this.parentView.value.cid === "chatroot")) {
            this.isActive = true;
        } else {
            this.isActive = false;
        }

        // console.log("updating value ChatBoxView, isActive="+this.isActive+", this.id="+this.id);
        if (!this.isActive) {
            this.childViewTypes = {};
        } else {
            this.childViewTypes = {
                header: NodeHeaderView,
                children: OutlineListView
            };
        }
    };
    ChatBoxView.prototype.layoutUp = function () {
    };
    ChatBoxView.prototype.render = function () {
        if (this.isActive) {
            // console.log("ChatBoxView, rendering with isActive=true, id="+this.id);
            return _super.prototype.render.call(this);
        } else {
            // console.log("ChatBoxView, not rendering with isActive=false, id="+this.id);
            return null;
        }
    };
    ChatBoxView.prototype.layoutDown = function () {
        var p = this.parentView.parentView.layout;
        if (!this.layout) {
            this.layout = {};
        }
        if (this.isActive) {
            this.layout.left = 0;
            this.layout.width = this.parentView.layout.width;
            this.layout.height = Math.round(1.25 * View.fontSize) + 2 * Math.round(.3 * View.fontSize);
            this.layout.top = p.height - this.layout.height;
        } else {
            this.layout.left = 0;
            this.layout.width = 0;
            this.layout.height = 0;
            this.layout.top = 0;
        }
    };
    return ChatBoxView;
})(NodeView);
//# sourceMappingURL=ChatBoxView.js.map
