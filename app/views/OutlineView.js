

$D.RecurseListTemplate = M.ListView.subclass({
    /* isTemplate: true, */
    isInset:true,
    listItemTemplateView:null,
    contentBinding:{
        target:$D.dummyController,
        property:'listObject'
    },
    items: 'models', // for Backbone.Collection compatibility
    idName:'cid' // for Backbone.Collection compatibility
});

$D.MyListItem = M.ListItemView.subclass({
    /* isTemplate: true, */
    childViews:'header children',
    hasSingleAction:false,
    isSelectable:false,
    modelType: $D.OutlineNodeModel,
    header:M.ContainerView.subclass({
        cssClass:'outline-header',
        childViews:'handle name',
        handle:M.ImageView.subclass({
            value:'theme/images/drag_icon.png',
            cssClass:'drag-handle disclose ui-disable-scroll'
        }),
        name:M.ContainerView.subclass({
            childViews: 'text',
            text: M.TextEditView.subclass({
                cssClass: 'outline-content ui-input-text ui-body-c ui-corner-all ui-shadow-inset',
                hasMultipleLines: true,
                valuePattern:'<%= text %>'
            })
        })
    }),

    children: $D.RecurseListTemplate
});

$D.RecurseListTemplate.prototype.listItemTemplateView = $D.MyListItem;

