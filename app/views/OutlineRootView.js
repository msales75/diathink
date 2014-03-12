var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ListView.js");
var OutlineRootView = (function (_super) {
    __extends(OutlineRootView, _super);
    function OutlineRootView(opts) {
        _super.call(this, opts);
        OutlineManager.add(this.id, this);
    }
    OutlineRootView.prototype.init = function () {
        this.listItemTemplateView = NodeView;
        this.Class = OutlineRootView;
    };

    OutlineRootView.prototype.updateValue = function () {
        assert(this.parentView.parentView instanceof PanelView, "Invalid location for root list");
        this.panelView = this.parentView.parentView;
        if (this.panelView.value != null) {
            this.value = this.panelView.value.get('children');
        } else {
            this.value = $D.data;
        }
    };

    OutlineRootView.prototype.destroy = function () {
        var context, elem = this.elem;
        if (elem) {
            context = this.saveContext();
        } else {
            context = null;
        }
        OutlineManager.remove(this); // move to graveyard

        // is the rest of this standard destroy-operation?
        View.prototype.destroy.call(this);
        return context;
    };

    OutlineRootView.prototype.setData = function (key, val) {
        if (!this.data) {
            this.data = {};
        }
        if (val != null) {
            this.data[key] = val;
        } else {
            delete this.data[key];
        }
    };

    OutlineRootView.prototype.getData = function (key) {
        if (!this.data) {
            return null;
        } else if (this.data[key] == null) {
            return null;
        } else {
            return this.data[key];
        }
    };
    return OutlineRootView;
})(ListView);
//# sourceMappingURL=OutlineRootView.js.map
