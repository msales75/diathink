
// Note that controllers must be defined before view.
// TODO later support partial-list loading?

diathink.OutlineManager = M.Object.extend({
    type: 'OutlineManager',
    outlines: {},
    add: function(id, controller) {
        this.outlines[id] = controller;
    },
    remove: function(id) {
        this.outlines[id].destroy();
        delete this.outlines[id];
    }

});

/*
diathink.updateScroll = function() {
    // make sure that textarea is over correct span
    if (diathink.focused) {
        $('#'+M.ViewManager.getCurrentPage().hiddeninput.id)
            .css('left', $(diathink.focused).offset().left+'px')
            .css('top', $(diathink.focused).offset().top+'px');
    }
};
*/

diathink.OutlineController = M.Controller.extend({
    type: 'diathink.OutlineController',
    rootID: null,
    bindView: function(view) { // bind this constructor-instance to this view
        this.rootID = view.id;
        view.setRootID();
        diathink.OutlineManager.add(this.rootID, this);
    },
    destroy: function() {
        var i, v, view, models;
        view = M.ViewManager.getViewById(this.rootID);
        models = view.value.models;
        for (i=0; i<models.length; ++i) {
            models[i].views[this.rootID].destroy();
        }
    },
    listObject:[]
});

diathink.dummyController = M.Controller.extend({
    dummyListClicked:function (id, nameId) {
        //console.log('You clicked on the list item with the DOM id: ', id, 'and has the name', nameId);
    },
    listObject:[]
});

// nest horizontal pages, expand/contract? drag/drop?
  // save perspectives? hmm.


// TODO: Where do we store and check for triggers?


