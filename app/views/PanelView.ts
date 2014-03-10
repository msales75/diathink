///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");
class PanelView extends ContainerView {
    breadcrumbs:BreadcrumbView;
    outline:OutlineScrollView;
    top:number;
    left:number;
    width:number;
    height:number;
    value:Backbone.Model = null;
    Class:any;

    init() {
        this.Class = PanelView;
        this.childViewTypes = {
            breadcrumbs: BreadcrumbView,
            outline: OutlineScrollView
        }
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

    // todo: View.destroy generally has options of saving context?
    destroy() {
        var c:ElemContext, elem = this.elem;
        if (elem) {
            var c = this.saveContext();
        } else {
            c = null;
        }
        // this.outline.alist.destroy();
        // this.outline.alist = null;
        View.prototype.destroy.call(this);
        return c;
    }

    changeRoot(model, rootID) { // id is name of model-id or null
        var newlist:OutlineRootView;
        var c = this.outline.alist.destroy();
        if (model===undefined) {model = null;}
        this.value = model;
        newlist = new OutlineRootView({id: rootID, parentView: this.outline}); // new rootID
        this.outline.alist = newlist;
        // problem: ui-scrollview-view doesn't always exist until theming
        this.outline.alist.renderAt(c);
        this.breadcrumbs.updateValue();
        this.breadcrumbs.renderUpdate();
        this.outline.alist.postRender();
        $('#' + View.getCurrentPage().id).nestedSortable('update');
        $(window).resize(); // fix height of new panel, spacer
        $D.PanelManager.rootViews[this.id] = newlist.id;
        $D.PanelManager.rootModels[this.id] = model;
        return newlist.id;
    }
}

