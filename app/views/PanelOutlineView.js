
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
    changeRoot: function(model) { // id is name of model-id or null
        diathink.OutlineManager.remove(this.outline.alist.rootID);
          // will get added back in with alist.onDesign:bindView
        this.rootModel = model;
        this.breadcrumbs.onDesign();
        this.outline.alist.onDesign();
        $('#'+this.id).replaceWith(this.render()); // is this necessary?
        // todo: garbage collection on old html/event-handlers?
        this.theme();
        this.registerEvents();
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
        childViews:'alist',
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
                this.bindToCaller(this, M.View.registerEvents)();
                this.contentBinding.target.set('listObject', collection);
                $('#'+this.id).nestedSortable({
                    listType:'ul',
                    items:'li',
                    doNotClear:true,
                    isTree:true,
                    branchClass:'branch',
                    leafClass:'leaf',
                    collapsedClass:'collapsed',
                    expandedClass:'expanded',
                    hoveringClass:'sort-hover',
                    errorClass: 'sort-error',
                    handle:'> div > div > a > div > .drag-handle',
                    buryDepth:3,
                    scroll:false,
                    dropLayer: $('.droplayer'),
                    helper: function (e, item) {
                        return item.clone().appendTo('.drawlayer').css({
                            position: 'absolute',
                            left: $(item).offset().left+'px',
                            top: $(item).offset().top+'px'
                        });
                    },
                    // appendTo: '.droplayer',
                    start: function(e, hash) {
                        hash.item.parents().each(function() {
                            $(this).addClass('drag-hover');
                        });
                        /*
                        hash.item.parents('li').each(function() {
                            $(this).addClass('drag-hover');
                        });
                        hash.item.parents('ul').each(function() {
                            $(this).addClass('drag-hover');
                        });
                        */

                        // hash.item.css('border','solid 1px orange');
                    },
                    stop:function (e, hash) { // (could also try 'change' or 'sort' event)
                        if (hash.item.parents('ul').length > 0) {
                            M.ViewManager.getViewById($(hash.item.parents('ul').get(0)).attr('id')).themeUpdate();
                            M.ViewManager.getViewById($(hash.originalDOM.parent).attr('id')).themeUpdate();
                        }
                        var toplines = $('.topline:hover');
                        var bottomlines = $('.bottomline:hover');
                        if (toplines.length>0) {
                            console.log("Moving above element "+toplines.parents("li:first").attr('id'));
                        } else if (bottomlines.length>0) {
                            console.log("Moving below element "+bottomlines.parents("li:first").attr('id'));
                        }
                        $('.drag-hover').removeClass('drag-hover');
                        // hash.item.css('border','');
                        console.log("Processed change to structure");
                    },
                    // handle: '> div > div > a > div > .handle',
                    toleranceElement:'> div > div > a > div.outline-header'
                });
            },
            isInset:'YES',
            listItemTemplateView:diathink.MyListItem,
            idName:'cid', // For Backbone.Model compatibility
            items: 'models' // For Backbone.Model compatibility
        })
    })
});
