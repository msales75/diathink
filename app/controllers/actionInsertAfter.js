/* Strategy:

 * Do viewExec and viewUndo for a full-featured command, and
 * let the options filter what is done in context.

 * model-execution, multi-view execution,
 * assumptions and issue-management,
 * is handled at a second layer

 * Droptargets are a third layer
 */


diathink.Action = M.Object.extend({
    historyID:null,
    // (might be necessary for calling to identify each change in the view?)
    type:"Action",
    options:{},
    triggers:null,
    createAndExec:function (options) { // create a new action object
        var action = this.extend({});
        _.extend(action.options, options);
        action.exec();
        return action;
    },
    preview:function () {
        // no instantiation or parameter-saving
    },
    exec:function (options) {
        var o, i;
        _.extend(this.options, options);
        o = this.options;

        if (this.id) {
            // diathink.HistoryController.redo(this);
        } else {
            // diathink.HistoryController.add(action);
        }
        this.execModel();
        // todo: assumptions and issue-handling
        var outlines = diathink.OutlineManager.outlines;
        if (!o.excludeAllViews) {
            for (i in outlines) {
                if (o.excludeView) {
                    if (options.excludeView === o) continue;
                }
                this.execView(outlines[i]);
            }
        }
    },
    undo:function (options) {
    },

    getModelFromView:function (id) {
        return M.ViewManager.getViewById(id).modelId;
    },
    getOutlineFromView:function (id) {
        return M.ViewManager.getViewById(id).rootID;
    },
    getViewFromModel:function (modelId, outline) {
        return Backbone.RelationalModel.findOrCreate(modelId).views[outline];
    },
    // utility functions
    newListItemView:function (parentView, id) { // (id only if known)
        var templateView = parentView.listItemTemplateView;
        M.assert(templateView != null);
        templateView.events = templateView.events ? templateView.events : parentView.events;

        var li = templateView.design({});
        var item = {text:this.options.lineText}; // from list
        li = parentView.cloneObject(li, item);
        li.value = item; // enables getting the value/contentBinding of a list item in a template view.
        li.parentView = parentView;
        if (id) { // if the model-id is known
            li.modelId = id;
        }
        return li;
    },

    // SHOW methods - various visualization actions,
    //  often overriden by each action-type
    _showDisplacement:function () {
        // animate appearance/disappearance of a line
    },
    _showFinalization:function () {
        // animate indicating completion of an action (e.g. double-blink)
    },
    _showDifference:function () {
        // like arrows showing movement, might include user/time display
    },
    _showDrag:function () {
        // or text slide or cross-out
    },
    _showHiddenChange:function () {
        // for edits on invisible or minimized areas
    },
    _showOffscreen:function () {
        // show annotation for changes above/below the scroll-area
    },
    _focusScroll:function () {
        // scroll the view to show the new location
    },
    _focusCursor:function () {

    },
    _showKeystroke:function () {
        // for tutorials
    },


    /*
     Action execution in different contexts

     Action contexts (methods in top-level actions)
     * previewing a change when dragging (various drop-targets)
     * showing change from keyboard-command (focus change)
     * finalizing a change that's previewed
     * showing previewed change in another part of screen
     * showing finalized change in another part of screen
     * showing remote real-time change
     * showing a change from undo/redo buttons
     * showing remote asynchronous change from syncing
     * showing a selected change from the history
     * showing a selected change from the issue-list

     */

});


diathink.InsertAfterAction = diathink.Action.extend({
    type:"InsertAfterAction",
    options: {targetID: null, lineText: "", transition: false}, // visual candy options
    triggers:null,
    modelStatus:0,
    viewStatus:{},
    execModel:function () {
        if (this.modelStatus !== 0) {
            return;
        }
        this.modelStatus = -1;
        // insert to collection
        new diathink.OutlineNodeModel({
            text: this.options.lineText,
            children: [],
            parent: diathink.OutlineNodeModel.findOrCreate(this.options.targetID)
        });
        // parentCollection.unshift();
        this.modelStatus = 1;
    },
    execView:function (outline) {
        // var c = diathink.app.getConfig('outlineView');
        if (this.viewStatus[outline.rootID] !== undefined) {
            return;
        }
        this.viewStatus[outline.rootID] = 1;
        var viewID = diathink.OutlineNodeModel.findOrCreate(outline.rootID).views[outline.rootID];
        var parentView = M.ViewManager.getViewById(viewID).parentView;

        var li = this.newListItem(parentView);
        $('#' + viewID).after(li.render());
        li.registerEvents();
        li.theme();
        this.viewStatus[outline.rootID] = 2;
        // parentView.themeUpdate(); // is this necessary?
    },
    undoView:function (view) {},
    validateView:function (view) {},
    validateModel: function() {}
});

/*
 M.Action.add("InsertInto",function(id, x) {

 });

 M.Action.add("InsertBefore",function(id, x) {

 });

 M.Action.add("Remove",function(id, x) {

 });

 M.Action.add("MoveInto",function(id, x) {

 var parentItem = (this.placeholder.parentDepth(o.buryDepth+2).get(0) &&
 this.placeholder.parentDepth(o.buryDepth+2).closest('.ui-sortable').length)
 ? this.placeholder.parentDepth(o.buryDepth+2)
 : null,
 level = this._getLevel(this.placeholder);

 });

 M.Action.add("MoveAfter",function(id, x) {


 });

 M.Action.add("MoveBefore",function(id, x) {

 });

 */

/* Implement this when doing drag/drop changes
 dropTargets: function() {
 // "drop-candidates" not minimized, possibly only on-screen
 // each candidate needs to identify its compatibility, action-type and assumptions
 }
 */

