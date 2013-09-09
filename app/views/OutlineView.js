
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
/*    topline:M.ContainerView.extend({
        cssClass: 'topline',
        childViews: 'dashline',
        dashline:M.ContainerView.extend({
            cssClass: 'dashline'
        })
    }),
*/
    header:M.ContainerView.extend({
        cssClass:'outline-header',
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
                blur: { // update model with action
                    action:function(id, e) {
                        var value = $('#'+id).val();
                        var model = M.ViewManager.findViewById(id).parentView.parentView.value;
                        if (model.get('text') !== value) {
                            diathink.TextAction.createAndExec({
                                targetID: model.cid,
                                text: $('#'+id).val()
                            });
                        }
                    }
                },
                keydown:{
                    action: function (id, e) {
                        var liView = M.ViewManager.findViewById(id).parentView.parentView;
                        if (e.which === 32) { // spacebar
                            var sel = $('#'+id).selection();
                            // check if cursor is on far left of textbox
                            if (sel && (sel[0] === 0) && (sel[1] === 0)) {
                                // get parent-collection and rank
                                var collection = liView.parentView.value;
                                var rank = _.indexOf(collection.models, liView.value);
                                // validate rank >=0
                                if (rank>0) { // indent the line
                                    // make it the last child of its previous sibling
                                    diathink.MoveIntoAction.createAndExec({
                                        referenceID: collection.models[rank-1].cid,
                                        targetID: liView.modelId,
                                        focusView: liView.rootID
                                    });
                                    e.preventDefault();
                                }
                            }
                        } else if (e.which === 9) { // tab
                            var collection = liView.parentView.value;
                            var rank = _.indexOf(collection.models, liView.value);
                            // validate rank >=0
                            if (rank>0) { // indent the line
                                // make it the last child of its previous sibling
                                diathink.MoveIntoAction.createAndExec({
                                    referenceID: collection.models[rank-1].cid,
                                    targetID: liView.modelId,
                                    focusView: liView.rootID
                                });
                                e.preventDefault();
                            }
                        } else if (e.which === 8) { // backspace
                            var sel = $('#'+id).selection();
                            if (sel && (sel[0] === 0) && (sel[1] === 0)) {
                                // get parent-collection and rank
                                var collection = liView.parentView.value;
                                var rank = _.indexOf(collection.models, liView.value);
                                // if it is the last item in its collection
                                if ((liView.parentView.parentView != null) &&
                                    (liView.parentView.parentView.type==='M.ListItemView')&&
                                    (rank===collection.models.length-1)) {
                                    // make it the next child of its parent
                                    diathink.OutdentAction.createAndExec({
                                        referenceID: liView.value.attributes.parent.cid,
                                        targetID: liView.modelId,
                                        focusView: liView.rootID
                                    });
                                    e.preventDefault();
                                } else { // delete or merge-lines?
                                    if ($('#'+id).val() === "") {
                                        diathink.DeleteAction.createAndExec({
                                            targetID: liView.modelId
                                        });
                                    }
                                }
                            }
                        } else if (e.which === 13) { // enter
                            // todo: split line if in middle of text
                            diathink.InsertAfterAction.createAndExec({
                                referenceID: liView.modelId,
                                focusView: liView.rootID
                            });
                        }
                        e.stopPropagation();
                        console.log("Processed keyup with which=" + e.which + " and keycode=" + e.keyCode);
                    },
                    manualPropogation: true // don't automatically kill event propogation
                }
            }
        })
    }),

    children: diathink.RecurseListTemplate

    /*
    bottomline: M.ContainerView.extend({
        cssClass: 'bottomline',
        childViews: 'dashline',
        dashline:M.ContainerView.extend({
            cssClass: 'dashline'
        })
    })
    */

});

diathink.RecurseListTemplate.listItemTemplateView = diathink.MyListItem;

