
m_require("app/views/OutlineView.js");

$D.PanelOutlineView = M.ContainerView.subclass({
    type: '$D.PanelOutlineView',
    isTemplate: true, // causes design to run recursively
    rootModel: null,
    rootController: null,
    childViews: "breadcrumbs outline",
    onDesign: function() {
        if (this.rootController == null) { // if one isn't provided in design
            this.rootController = $D.OutlineController.extend({
                panelView: this
           });
        }
    },
    cachePosition: function() {
        // todo: cache top/left/height/width
        this.elem = $('#'+this.id);
        var offset = this.elem.offset();
        this.top = offset.top;
        this.left= offset.left;
        this.height = this.elem.height();
        this.width = this.elem.width();
    },
    destroyRootOutline: function() {
        $D.OutlineManager.outlines[this.outline.alist.rootID].destroy();
        // $D.OutlineManager.remove(this.outline.alist.rootID);
        // will get added back in with alist.onDesign:bindView
        this.outline.alist.detachContentBinding();
        // save context
        var c = this.outline.alist.saveContext();
        this.outline.alist.destroy();
        return c;
    },
    destroy: function() {
        var c = this.saveContext();
        this.destroyRootOutline();
        M.Object.destroy.apply(this, arguments);
        return c;
    },
    changeRoot: function(model, rootID) { // id is name of model-id or null
        var newlist;

        var c = this.destroyRootOutline();

        if (rootID) {
            this.rootController = $D.OutlineManager.deleted[rootID];
            if (!this.rootController || (this.rootController.panelView.id !== this.id)) {
                console.log('rootController not found in graveyard');
                debugger;
            }
        } else {
            this.rootController = $D.OutlineController.extend({
                panelView: this
            });
        }

        this.rootModel = model;
        // need to give view an old rootID
        if (rootID) {
            newlist = new this.outline.alist({id: rootID}); // new rootID
        } else {
            newlist = new this.outline.alist({}); // new rootID
        }

        // newlist.parentView = this.outline;

        this.outline.alist = newlist;
        // problem: ui-scrollview-view doesn't always exist until theming
        this.outline.alist.renderAt(c);
        this.breadcrumbs.onDesign();
        this.breadcrumbs.renderUpdate();
        this.theme();
        this.registerEvents(); // calls renderUpdate for children recursively
        $('#'+M.ViewManager.getCurrentPage().id).nestedSortable('update');
        $(window).resize(); // fix height of new panel, spacer
        $D.PanelManager.rootViews[this.id] = newlist.id;
        $D.PanelManager.rootModels[this.id] = model;

        return newlist.id;
    },
    panelInit: function() {

    },
    breadcrumbs:M.BreadcrumbView.subclass({
        value: [],
        onDesign: function() { // once rootModel is defined in design-stage, define breadcrumbs
            this.defineFromModel(this.parentView.rootModel);
        }
    }),
    outline: M.ScrollView.subclass({
        childViews:'alist droplayer scrollSpacer',
        /* updateScroll: $D.updateScroll, */ // called whenever scrollview changes
        alist:M.ListView.subclass({
            rootModel: null,
            onDesign: function() { // once parent's rootModel is defined in design-stage
                this.rootModel = this.parentView.parentView.rootModel;
                this.value = null; // remove any pre-existing collection-reference
                // MS: fix bug all outlines have same controller
                this.contentBinding = {
                    target: this.parentView.parentView.rootController,
                    property:'listObject'
                };
                this.contentBinding.target.bindView(this);
            },
            registerEvents: function() {
                var collection, that = this;
                if (this.rootModel === null) {
                    collection = $D.data;
                } else {
                    collection = this.rootModel.get('children');
                }
                // this.bindToCaller(this, M.View.prototype.registerEvents)();
                // todo: stop using content-binding to initialize lists,
                //  but still need to refresh nestedSortable ?
                this.contentBinding.target.set('listObject', collection);
                // update the panel's dimensions
                setTimeout(function() {
                    that.parentView.parentView.cachePosition();
                }, 0);
            },
            isInset: true,
            listItemTemplateView:$D.MyListItem,
            idName:'cid', // For Backbone.Model compatibility
            items: 'models' // For Backbone.Model compatibility
        }),
        scrollSpacer:M.ContainerView.subclass({
            cssClass: 'scroll-spacer'
        }),
        droplayer: M.ContainerView.subclass({
            cssClass: 'droplayer'
        })
    })
});
