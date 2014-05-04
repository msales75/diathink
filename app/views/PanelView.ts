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
    breadcrumbs:BreadcrumbView;
    outline:OutlineScrollView;
    value:OutlineNodeModel;
    top:number;
    left:number;
    width:number;
    height:number;
    Class:any;
    widthFrac:string;
    animating:boolean = false;

    init() {
        this.Class = PanelView;
        this.childViewTypes = {
            breadcrumbs: BreadcrumbView,
            outline: OutlineScrollView
        }
        assert(PanelView.panelsById[this.id]===undefined, "Multiple panels with same ID");
        PanelView.panelsById[this.id] = this;
    }
    render() {
        this._create({
            type: 'div',
            classes: this.cssClass,
            html: '<div class="inner-panel"></div>'
        });
        this.renderChildViews();
        for (var name in this.childViewTypes) {
            this.elem.children[0].appendChild((<View>(this[name])).elem);
        }
        return this.elem;
    }
    freezeWidth() {
        var width = this.elem.clientWidth;
        $(this.elem).css('width', String(width)+'px');
    }

    cachePosition() {
        // todo: cache top/left/height/width
        var el = $(this.elem);
        var offset = el.offset();
        this.top = offset.top;
        this.left = offset.left;
        this.height = this.elem.clientHeight;
        this.width = this.elem.clientWidth;
    }

    destroy() {
        delete PanelView.panelsById[this.id];
        new DeadPanel(this);
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
        this.cachePosition();
        NodeView.refreshPositions();

        $(window).resize(); // fix height of new panel, spacer; a bit hacky
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

