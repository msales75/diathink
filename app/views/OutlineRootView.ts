///<reference path="View.ts"/>
m_require("app/views/ListView.js");

class DeadOutlineRoot extends DeadView {
    value:OutlineNodeCollection;
    data;
    constructor(outline:OutlineRootView) {
        super(outline);
        this.data= outline.data;
        // set width equal to panel based on current screensize
    }
    getOptions() {
        return {
            id: this.id,
            parentView: View.get(this.parent),
            value:this.value,
            data: this.data
        };
    }
    resurrect():OutlineRootView {
        delete DeadView.viewList[this.id];
        return new OutlineRootView(this.getOptions());
    }
    validate() {
        super.validate();
        assert(this.value instanceof OutlineNodeCollection,
            "DeadOutline "+this.id+" does not have a valid value");
    }
}
class OutlineRootView extends ListView {
    static outlinesById:{[id:string]:OutlineRootView} = {};
    parentView:OutlineScrollView;
    value:OutlineNodeCollection;
    isAbsolute = false;
    data; // preserves collapse/expanded status within panel-outline
    init() {
        this.listItemTemplate = NodeView;
    }
    constructor(opts) {
        super(opts);
        OutlineRootView.outlinesById[this.id] = this;
    }
    updateValue() { // once parent's rootModel is defined in design stage
        if (this.panelView!=null) { // if we are not detached from a panel
            assert(this.parentView.parentView instanceof PanelView,
                "Invalid location for root list");
            this.value = this.panelView.value.get('children');
        }
    }
    layoutDown() {
        if (this.layout==null) {this.layout = {};}
        this.layout.top = 0;
        this.layout.left = 0;
        this.layout.width = this.parentView.layout.width;
    }
    layoutUp() {
        super.layoutUp();
        // todo: special hack for fixing scroll-canvas?
    }

    destroy() { // move to graveyard, never(?) completely destroy this view
        var context, elem = this.elem;
        if (elem) {
            context = this.saveContext();
        } else {
            context = null;
        }
        new DeadOutlineRoot(this); // move to graveyard
        delete OutlineRootView.outlinesById[this.id];
        super.destroy();
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
        if (!this.data) {return false;}
        else if (this.data[key] == null) {return false;}
        else {return this.data[key];}
    }
    validate() {
        super.validate();
        var outlines:{[i:string]:OutlineRootView} = OutlineRootView.outlinesById;
        var panels:{[i:string]:PanelView} = PanelView.panelsById;
        var o:string = this.id;
        assert(outlines[this.id] === this, "Outline " + this.id + " not in list");
        assert(_.size(this.childViewTypes)===0,
            "Outline view "+o+" does not have zero childViewTypes");
        assert(this.nodeRootView === this,
            "OutlineRootView "+o+" does not have nodeRootView==self");
        assert(this.parentView.nodeRootView === null,
            "OutlineRootView "+o+" has parent with same nodeRootView");
        // for now, require all outlines to be in a panel
        assert(panels[this.parentView.parentView.id] instanceof PanelView,
            "Outline view " + o + " does not have parent-parent-view a panel");
        assert(this.parentView.parentView.outline.alist === this,
            "Outline view " + o + " does not match parent.parent.outline.alist in a panel");
        assert(this.value instanceof OutlineNodeCollection,
            "OutlineRootView "+o+" does not have value of type OutlineNodeCollection");
        // todo: validate this.data[key]=val
    }
}