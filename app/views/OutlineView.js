
diathink.RecurseListTemplate = M.ListView.extend({
    /* isTemplate: true, */
    isInset:true,
    listItemTemplateView:null,
    contentBinding:{
        target:diathink.dummyController,
        property:'listObject'
    },
    items: 'models', // for Backbone.Collection compatibility
    idName:'cid' // for Backbone.Collection compatibility
});

diathink.MyListItem = M.ListItemView.extend({
    /* isTemplate: true, */
    childViews:'header children',
    hasSingleAction:false,
    isSelectable:false,
    modelType: diathink.OutlineNodeModel,
    header:M.ContainerView.extend({
        cssClass:'outline-header',
        childViews:'handle name',
        handle:M.ImageView.extend({
            value:'theme/images/drag_icon.png',
            cssClass:'drag-handle disclose ui-disable-scroll'
        }),
        name:M.ContainerView.extend({
            childViews: 'text',
            text: M.TextEditView.extend({
                cssClass: 'outline-content ui-input-text ui-body-c ui-corner-all ui-shadow-inset',
                hasMultipleLines: true,
                valuePattern:'<%= text %>'
            })
        })
    }),

    children: diathink.RecurseListTemplate
});

diathink.RecurseListTemplate.listItemTemplateView = diathink.MyListItem;

