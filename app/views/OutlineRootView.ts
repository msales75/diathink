///<reference path="View.ts"/>
///<reference path="../OutlineManager.ts"/>
m_require("app/views/ListView.js");
class OutlineRootView extends ListView {
    parentView:OutlineScrollView;
    data; // preserves collapse/expanded status within panel-outline
    init() {
        this.listItemTemplateView = NodeView;
        this.Class = OutlineRootView;
    }

    constructor(opts) {
        super(opts);
        OutlineManager.add(this.id, this);
    }

    updateValue() { // once parent's rootModel is defined in design-stage
        assert(this.parentView.parentView instanceof PanelView, "Invalid location for root list");
        this.panelView = <PanelView> this.parentView.parentView;
        if (this.panelView.value != null) {
            this.value = this.panelView.value.get('children');
        } else {
            this.value = $D.data;
        }
    }

    destroy() { // move to graveyard, never(?) completely destroy this view
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
    }

    setData(key, val) {
        if (!this.data) {this.data = {};}
        if (val != null) {
            this.data[key] = val;
        } else {
            delete this.data[key];
        }
    }

    getData(key) {
        if (!this.data) {return null;}
        else if (this.data[key] == null) {return null;}
        else {return this.data[key];}
    }
}