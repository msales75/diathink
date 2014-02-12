
diathink.PanelOutlineView = M.ContainerView.extend({
    type: 'diathink.PanelOutlineView',
    isTemplate: true, // causes design to run recursively
    rootModel: null,
    rootController: null,
    childViews: "breadcrumbs outline",
    onDesign: function() {
        if (this.rootController == null) { // if one isn't provided in design
            this.rootController = diathink.OutlineController.extend({
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
        diathink.OutlineManager.outlines[this.outline.alist.rootID].destroy();
        // diathink.OutlineManager.remove(this.outline.alist.rootID);
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
            this.rootController = diathink.OutlineManager.deleted[rootID];
            if (!this.rootController || (this.rootController.panelView.id !== this.id)) {
                console.log('rootController not found in graveyard');
                debugger;
            }
        } else {
            this.rootController = diathink.OutlineController.extend({
                panelView: this
            });
        }

        this.rootModel = model;
        // need to give view an old rootID
        if (rootID) {
            newlist = this.outline.alist.designWithID({id: rootID}); // new rootID
        } else {
            newlist = this.outline.alist.design({}); // new rootID
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
        diathink.PanelManager.rootViews[this.id] = newlist.id;
        diathink.PanelManager.rootModels[this.id] = model;

        return newlist.id;
    },
    panelInit: function() {

    },
    breadcrumbs:M.BreadcrumbView.extend({
        value: [],
        onDesign: function() { // once rootModel is defined in design-stage, define breadcrumbs
            this.defineFromModel(this.parentView.rootModel);
        }
    }),
    outline: M.ScrollView.extend({
        childViews:'alist droplayer scrollSpacer',
        /* updateScroll: diathink.updateScroll, */ // called whenever scrollview changes
        alist:M.ListView.extend({
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
                    collection = diathink.data;
                } else {
                    collection = this.rootModel.get('children');
                }
                // this.bindToCaller(this, M.View.registerEvents)();
                // todo: stop using content-binding to initialize lists,
                //  but still need to refresh nestedSortable ?
                this.contentBinding.target.set('listObject', collection);
                // update the panel's dimensions
                setTimeout(function() {
                    that.parentView.parentView.cachePosition();
                }, 0);
            },
            isInset: true,
            listItemTemplateView:diathink.MyListItem,
            idName:'cid', // For Backbone.Model compatibility
            items: 'models' // For Backbone.Model compatibility
        }),
        scrollSpacer:M.ContainerView.extend({
            cssClass: 'scroll-spacer'
        }),
        droplayer: M.ContainerView.extend({
            cssClass: 'droplayer'
        })
    })
});
