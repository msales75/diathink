///<reference path="View.ts"/>
///<reference path="../events/Router.ts"/>
m_require("app/views/ContainerView.js");

class DeadPanel extends DeadView {
    value:OutlineNodeModel;
    outlineID:string;
    constructor(panel:PanelView) {
        super(panel);
        this.outlineID = panel.outline.id;
    }
    getOptions() {
        return {
            id:this.id,
            parentView: View.get(this.parent),
            value:this.value,
            childOpts:{
                outline: {
                    id: this.outlineID
                }
            }
        };
    }
    resurrect():PanelView {
        delete DeadView.viewList[this.id];
        return new PanelView(this.getOptions());
    }
    validate() {
        super.validate();
        assert(this.value instanceof OutlineNodeModel,
            "Panel "+this.id+" does not have a valid value");
        assert(DeadView.viewList[this.outlineID] instanceof DeadOutlineScroll,
           "Dead panel "+this.id+" does not have dead outline "+this.outlineID);
    }
}

class PanelView extends View {
    static panelsById:{[i:string]:PanelView} = {};
    parentView:PanelGridView;
    breadcrumbs:BreadcrumbView;
    outline:OutlineScrollView;
    inserter:InsertionView;
    deletebutton:PanelDeleteView;
    chatbox:ChatBoxView;
    socialbox:SocialBoxView;
    newroom:NewRoomView;
    value:OutlineNodeModel;
    parentPanel:PanelView;
    childPanel:PanelView;
    cssClass = 'panel';
    listRank:number;
    top:number;
    left:number;
    width:number;
    height:number;
    Class:any;
    animating:boolean = false;

    browseChat:boolean;
    isChat:boolean;


    init() {
        this.childViewTypes = {
            breadcrumbs: BreadcrumbView,
            inserter: InsertionView,
            outline: OutlineScrollView,
            deletebutton:PanelDeleteView,
            chatbox:ChatBoxView,
            socialbox:SocialBoxView,
            newroom:NewRoomView
        };
        assert(PanelView.panelsById[this.id]===undefined, "Multiple panels with same ID");
        PanelView.panelsById[this.id] = this;
    }
    updateValue() {
        if (this.parentPanel!=null) {
            assert(this.parentPanel instanceof PanelView, "");
            this.parentPanel.childPanel = this;
        }
        this.isChat = false;
        this.browseChat = false;
        if (this.value && this.value.attributes.text==='Browse') {
           this.browseChat = true;
        }
        if (this.value && this.value.attributes.text==='Chat') {
            this.isChat = true;
        }
    }
    layoutDown() {
        var p = this.parentView.parentView.layout;
        if (!this.layout) {this.layout = {};}
        this.layout.top = 0;
        this.layout.width = this.parentView.itemWidth;
        this.layout.height = p.height;
    }
    positionChildren(v:View, v2?:string, validate?:boolean) {
        if (!v || (v===this.breadcrumbs)) {
            var l = this.outline.saveLayout();
            this.outline.layoutDown();
            this.outline.updateDiffs(l, validate);
            var l2 = this.inserter.saveLayout();
            this.inserter.layout.top = this.breadcrumbs.layout.height + Math.round(0.5*View.fontSize);
            this.inserter.updateDiffs(l2, validate);
            var l3 = this.newroom.saveLayout();
            this.newroom.layout.top = this.outline.layout.top+this.outline.alist.layout.height+4;
            this.newroom.updateDiffs(l3, validate);
        }
    }

    render() {
        var subpanel:string = '';
        if (this.parentPanel!=null) {
            subpanel = '<div class="subpanel"></div>';
        }
        this._create({
            type: 'div',
            classes: this.cssClass,
            html: '<div class="panel-border"></div>'+subpanel
        });
        this.renderChildViews();
        this.positionChildren(null);
        this.setPosition();
        for (var name in this.childViewTypes) {
            if ((<View>(this[name])).elem != null) {
                this.elem.appendChild((<View>(this[name])).elem);
            }
        }
        return this.elem;
    }

    cachePosition() {
        // todo: cache top/left/height/width
        var offset = this.getOffset();
        this.top = offset.top;
        this.left = offset.left;
        this.height = this.layout.height;
        this.width = this.layout.width;
    }

    destroy() {
        delete PanelView.panelsById[this.id];
        new DeadPanel(this);
        if (this.parentPanel!=null) {
            assert(this.parentPanel.childPanel===this, "");
            this.parentPanel.childPanel = null;
        }
        var i:number;
        var boxes:DropBox[] = this.dropboxes;
        if (boxes && boxes.length) {
            for (i=0; i<boxes.length; ++i) {
                boxes[i].remove();
            }
        }
        this.dropboxes = [];
        super.destroy();
    }

    changeRoot(model, rootID) { // id is name of model-id or null
        var newlist:OutlineRootView, deadRoot:DeadOutlineRoot;
        var c = this.outline.alist.destroy(); // OutlineRootView is now in graveyard
        if (model===undefined) {model = null;}
        this.value = model;
        if (rootID!=null) {
            assert(DeadView.viewList[rootID] instanceof DeadOutlineRoot,
                "RootID "+rootID+" is not in dead outline list");
        }
        newlist = new OutlineRootView({
            id: rootID, // resurrects DeadOutlineRoot if rootID!=null
            parentView: this.outline
        });
        this.outline.alist = newlist;
        this.outline.alist.renderAt(c);
        this.breadcrumbs.updateValue();
        this.breadcrumbs.renderUpdate();
        this.outline.positionChildren(); // fix droplayer height
        this.cachePosition();
        NodeView.refreshPositions();

        // $(window).resize(); // fix height of new panel, spacer; a bit hacky
        return newlist.id;
    }
    validate() {
        super.validate();
        var v = this.id;
        var outlines:{[i:string]:OutlineRootView} = OutlineRootView.outlinesById;
        var models = OutlineNodeModel.modelsById;
        var panels:{[i:string]:PanelView} = PanelView.panelsById;

        assert(panels[this.id] === this, "Panel " + this.id + " not in list");
        assert(this.panelView === this,
            "View "+v+" is a panelView that doesn't know it");

        assert(this.isFocusable === false,
            "PanelView " + v + " does not have isFocuable===false");
        assert(this.isDragHandle === false,
            "PanelView " + v + " does not have isFocuable===false");
        assert(this.isScrollable === false,
            "PanelView " + v + " does not have isScrollable===false");
        assert(this.isSwipable === false,
            "PanelView " + v + " does not have isSwipable===false");
        assert(this.nodeRootView === null,
            "PanelView " + v + " has nodeRootView not-null");
        assert(this.nodeView === null,
            "PanelView " + v + " has nodeView not-null");
        assert(this.scrollView === null,
            "PanelView " + v + " has scrollView not-null");
        assert(this.handleView === null,
            "PanelView " + v + " has handleView not-null");
        assert(this.clickView === null,
            "PanelView " + v + " has clickView not-null");
        assert(this.panelView === this,
            "PanelView " + v + " has panelView not-self");

        assert(this.breadcrumbs instanceof BreadcrumbView,
            "Panel " + v + " does not have breadcrumbs of correct type");
        assert(this.outline instanceof OutlineScrollView,
            "Panel " + v + " does not have outline of type OutlineScrollView");
        assert(this.outline.alist instanceof OutlineRootView,
            "Panel " + v + " has outline.alist without type OutlineRootView");

        assert(this.value === models[this.value.cid],
            "Panel " + v + " does not have a valid value");
        assert(this.value.get('children') === this.outline.alist.value,
            "Panel " + v + " does not have value match outline.alist.value");

        assert(this.parentView.listItems.obj[this.id] === this,
            "Panel "+this.id+" is not in grid listItems");

        assert(this.outline.value === null,
            "Panel " + v + " outline-value is not null");
    }
}

