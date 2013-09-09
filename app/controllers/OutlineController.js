
// Note that controllers must be defined before view.
// TODO later support partial-list loading?

diathink.OutlineManager = M.Object.extend({
    type: 'OutlineManager',
    outlines: {},
    add: function(id, controller) {
        this.outlines[id] = controller;
    }
});

diathink.OutlineController = M.Controller.extend({
    type: 'diathink.OutlineController',
    rootID: null,
    bindView: function(view) { // bind this constructor-instance to this view
        this.rootID = view.id;
        view.setRootID();
        diathink.OutlineManager.add(this.rootID, this);
    },
    remove: function(view) {
        // TODO
    },
    listObject:[],
    listObjectClicked:function (id, nameId) {
        console.log('You clicked on the list item with the DOM id: ', id, 'and has the name', nameId);
    },
    parentObjectClicked:function (id, nameId) {
        console.log('You clicked on the overall list with the DOM id: ', id, 'and has the name', nameId);
    },
    init:function () { // map DOM-id's to parts of the outline

    },

    focusObject:function(id) {
        var view = M.ViewManager.getViewById(id);
        var model = view.value;
        diathink.app.createPage("page_"+model.cid, model);
        this.switchToPage("page_"+model.cid);
        // alert('Focusing on model '+model.cid);
        // new outline object has a new root - make a completely new outline?
        // make a new mobile-page

    }
});

diathink.dummyController = M.Controller.extend({
    dummyListClicked:function (id, nameId) {
        console.log('You clicked on the list item with the DOM id: ', id, 'and has the name', nameId);
    },
    listObject:[]
});

// nest horizontal pages, expand/contract? drag/drop?
  // save perspectives? hmm.


// TODO: Where do we store and check for triggers?


