///<reference path="../foundation/view.ts"/>
///<reference path="../views/list.ts"/>
///<reference path="../views/list_item.ts"/>
///<reference path="../views/container.ts"/>
///<reference path="../views/BreadcrumbView.ts"/>
///<reference path="../views/OutlineView.ts"/>
///<reference path="../views/subviews.ts"/>
m_require("app/views/OutlineView.js");
declare var $D;
class OutlineRootView extends ListView {
    idName = 'cid';
    items = 'models';
    isInset = true;
    listItemTemplateView = MyListItem;
    panelView:PanelOutlineView;
    deleted:boolean = false;
    value:Backbone.Collection;
    data; // preserves collapse/expanded status within panel-outline
    Class;

    getChildTypes():ViewTypeList {
        this.Class = OutlineRootView;
        return {};
    }

    onDesign() { // once parent's rootModel is defined in design-stage
        this.panelView = <PanelOutlineView> this.parentView.parentView;
        if (this.panelView.value!=null) {
            this.value = this.panelView.value.get('children');
        } else {
            this.value = $D.data;
        }
        this.rootID = this.id;
        this.setRootID(this.id); // Though children haven't been defined yet
        this.deleted = false;
        $D.OutlineManager.add(this.rootID, this);
    }

    postRender() {
        var collection, that = this;
        this.renderUpdate(null);

        // update the panel's dimensions
        setTimeout(function() {
            (<PanelOutlineView>that.parentView.parentView).cachePosition();
        }, 0);
    }

    destroy(elem) { // move to graveyard, never(?) completely destroy this view
        var i, v, view, models;
        if (!elem) {elem = $('#' + this.id)[0];}
        var context = this.saveContext(null);
        $D.OutlineManager.remove(this.rootID); // move to graveyard
        this.deleted = true;
        // destroy the list-entries but not the root-view
        if (this.value) { // destroy all children
            models = this.value.models;
            for (i = 0; i < models.length; ++i) {
                if (models[i].views && models[i].views[this.rootID]) {
                    models[i].views[this.rootID].destroy();
                }
            }
        }
        if (elem) {
            if (elem.parentNode) {
                elem.parentNode.removeChild(elem);
            }
        }

        // question: do we unregister it with the view-manager?
        return context;
        // don't destroy outline-ul-shell-view?
    }
    resurrect(options):OutlineRootView {
        this.parentView = options.parentView;
        this.onDesign();
        return this;
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

class PanelOutlineView extends ContainerView {
    breadcrumbs:BreadcrumbView;
    outline:OutlineScrollView;
    top:number;
    left:number;
    width:number;
    height:number;
    value:Backbone.Model = null;
    Class:any;

    getChildTypes():ViewTypeList {
        this.Class = PanelOutlineView;
        return {
            breadcrumbs: BreadcrumbView,
            outline: OutlineScrollView
        }
    }

    cachePosition() {
        // todo: cache top/left/height/width
        this.elem = $('#' + this.id);
        var offset = this.elem.offset();
        this.top = offset.top;
        this.left = offset.left;
        this.height = this.elem.height();
        this.width = this.elem.width();
    }

    destroy(elem:HTMLElement) {
        var c = this.saveContext(elem);
        this.outline.alist.destroy(null);
        this.outline.alist = null;
        View.prototype.destroy.apply(this, arguments);
        return c;
    }

    changeRoot(model, rootID) { // id is name of model-id or null
        var newlist:OutlineRootView;
        var c = this.outline.alist.destroy(null);
        if (!model) {model = null;}
        this.value = model;


        if (rootID) { // ressurect old outline
            newlist = $D.OutlineManager.deleted[rootID].resurrect({parentView: this.outline});
            assert(newlist && (newlist.panelView.id===this.id), "Root ListView not found in graveyard");
        } else { // create new outline
            newlist = new OutlineRootView({parentView: this.outline}); // new rootID
        }

        this.outline.alist = newlist;
        // problem: ui-scrollview-view doesn't always exist until theming
        this.outline.alist.renderAt(c);
        this.breadcrumbs.onDesign();
        this.breadcrumbs.renderUpdate();
        this.theme(null);
        this.outline.alist.postRender();
        $('#' + View.getCurrentPage().id).nestedSortable('update');
        $(window).resize(); // fix height of new panel, spacer
        $D.PanelManager.rootViews[this.id] = newlist.id;
        $D.PanelManager.rootModels[this.id] = model;
        return newlist.id;
    }
}

