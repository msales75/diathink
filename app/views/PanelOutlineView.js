
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
    changeRoot: function(model, rootID) { // id is name of model-id or null
        var newlist;
        diathink.OutlineManager.outlines[this.outline.alist.rootID].destroy();
        // diathink.OutlineManager.remove(this.outline.alist.rootID);
          // will get added back in with alist.onDesign:bindView
        this.rootModel = model;
        if (rootID) {
            this.rootController = diathink.OutlineManager.deleted[rootID];
            if (!this.rootController || (this.rootController.panelView !== this)) {
                console.log('rootController not found in graveyard');
                debugger;
            }
        } else {
            this.rootController = diathink.OutlineController.extend({
                panelView: this
            });
        }
        this.outline.alist.detachContentBinding();
        // need to give view an old rootID
        if (rootID) {
            newlist = this.outline.alist.designWithID({id: rootID}); // new rootID
        } else {
            newlist = this.outline.alist.design({}); // new rootID
        }
        this.outline.alist.destroy();
        this.outline.alist = newlist;
        $('#'+this.outline.id).children('.ui-scrollview-view').prepend(this.outline.alist.render());
        this.breadcrumbs.onDesign();
        this.breadcrumbs.renderUpdate();
        this.theme();
        this.registerEvents(); // calls renderUpdate for children recursively
        $('#'+M.ViewManager.getCurrentPage().id).nestedSortable('update');
        $(window).resize(); // fix height of new panel, spacer
        return newlist.id;
    },
    breadcrumbs:M.BreadcrumbView.extend({
        rootModel: null,
        value: [],
        onDesign: function() { // once rootModel is defined in design-stage, define breadcrumbs
            var crumb;
            this.rootModel = this.parentView.rootModel;
            this.value = [];
            if (this.rootModel !== null) {
                crumb = this.rootModel;
                while (crumb != null) {
                    this.value.unshift(crumb);
                    crumb = crumb.get('parent');
                }
            }
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
                var collection;
                if (this.rootModel === null) {
                    collection = diathink.data;
                } else {
                    collection = this.rootModel.get('children');
                }
                // this.bindToCaller(this, M.View.registerEvents)();
                // todo: stop using content-binding to initialize lists,
                //  but still need to refresh nestedSortable ?
                this.contentBinding.target.set('listObject', collection);
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
