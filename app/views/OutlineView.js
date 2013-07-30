
diathink.RecurseListTemplate = M.ListView.design({
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
    idName:'name'
});

diathink.MyListItem = M.ListItemView.design({
    childViews:'header sublist',
    hasSingleAction:'NO',
    isSelectable:'NO',
    /*
     events: {
     tap: {
     target: diathink.OutlineController,
     action: 'listObjectClicked'
     }
     },
     */
    header:M.ContainerView.design({
        cssClass:'',
        childViews:'handle name',
        handle:M.ImageView.design({
            value:'theme/images/drag_icon.png',
            cssClass:'drag-handle disclose'
        }),
        name:M.TextFieldView.design({
            valuePattern:'<%= name %>',
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

                        }
                        console.log("Processed keyup with which=" + e.which + " and keycode=" + e.keyCode);
                    }
                }
            }
        })
    }),

    sublist:diathink.RecurseListTemplate

});

diathink.RecurseListTemplate.listItemTemplateView = diathink.MyListItem;

