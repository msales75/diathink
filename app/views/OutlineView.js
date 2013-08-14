
diathink.RecurseListTemplate = M.ListView.extend({
    isTemplate: true,
    isInset:'YES',
    listItemTemplateView:null,
    /*
     events: {
     tap: {
     target: diathink.dummyController,
     action: 'dummyListClicked'
     }
     },
     */
    contentBinding:{
        target:diathink.dummyController,
        property:'listObject'
    },
    items: 'models', // for Backbone.Collection compatibility
    idName:'cid' // for Backbone.Collection compatibility
});

diathink.MyListItem = M.ListItemView.extend({
    isTemplate: true,
    childViews:'header children',
    hasSingleAction:'NO',
    isSelectable:'NO',
    modelType: diathink.OutlineNodeModel,

    /* events: {
     tap: {
     target: diathink.OutlineController,
     action: 'listObjectClicked'
     }}, */

    header:M.ContainerView.extend({
        cssClass:'',
        childViews:'handle name',
        handle:M.ImageView.extend({
            value:'theme/images/drag_icon.png',
            cssClass:'drag-handle disclose'
        }),
        name:M.TextFieldView.extend({
            valuePattern:'<%= text %>',
            events:{
                enter:{
                    action:function (id, e) {
                        // console.log("Enter clicked on object with id "+id);
                        // console.log(e);
                    }
                },
                keyup:{
                    action:function (id, e) {
                        if (e.which === 32) { // spacebar

                        } else if (e.which === 9) { // tab
                            // NOTE: tab not always received with default browser behavior
                        } else if (e.which === 8) { // backspace

                        } else if (e.which === 13) { // enter
                            diathink.InsertAfterAction.createAndExec({
                                targetID: M.ViewManager.findViewById(id).parentView.parentView.modelId
                            });
                        }
                        console.log("Processed keyup with which=" + e.which + " and keycode=" + e.keyCode);
                    }
                }
            }
        })
    }),

    children:diathink.RecurseListTemplate

});

diathink.RecurseListTemplate.listItemTemplateView = diathink.MyListItem;

