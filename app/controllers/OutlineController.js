
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
    rootID: null,
    roots: [],
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
    insertInto:function (parent) {
        // log in history, noting user-context
        // (propogate log to server)
        // validate model
        // update model
        // update model loading-queue
        // validate view
        // update view
        // update view loading-queue
        // execute any triggers (consider queueing-priority carefully?)
        // execute triggers on parent (or tag or reference)
        // update trigger priority-queue
    },
    insertAfter:function (sibling) {
    },
    insertBefore:function (sibling) {
    },
    moveInto:function (id, parent) {
    },
    moveAfter:function (id, sibling) {
    },
    moveBefore:function (id, sibling) {
    },
    editText:function (id, text) {
    },
    editReference:function (id, target) {
    },
    addTag:function (id, tag) {
    },
    removeTag:function (id, tag) {
    },
    remove:function (id) {
    },
    addSourceTrigger:function (trigger_id) {
    },
    addTargetTrigger:function (trigger_id) {
    },
    removeSourceTrigger:function (trigger_id) {
    },
    removeTargetTrigger:function (trigger_id) {
    }
});

diathink.dummyController = M.Controller.extend({
    dummyListClicked:function (id, nameId) {
        console.log('You clicked on the list item with the DOM id: ', id, 'and has the name', nameId);
    },
    listObject:[]
});


// TODO: Where do we store and check for triggers?


