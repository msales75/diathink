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
    targetID: null,
    modelStatus: 0,
    viewStatus: {},
    init: function(options) {
        _.extend(this, {
            options: _.extend({}, this.options, options),
            targetID: null,
            triggers: null,
            modelStatus: 0,
            viewStatus: {}
        });
        return this;
    },
    createAndExec:function (options) { // create a new action object
        var action = this.extend({});
        action.init(options);
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
                    if (o.excludeView === i) continue;
                }
                var focus = false;
                if (o.focusView === i) {
                    focus = true;
                }
                this.execView(outlines[i], focus);
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
    newListItemView:function (parentView) { // (id only if known)
        // todo: should more of this be in cloneObject?
        var templateView = parentView.listItemTemplateView;
        M.assert(templateView != null);
        templateView.events = templateView.events ? templateView.events : parentView.events;

        var li = templateView.design({cssClass: 'leaf'}); // todo -- merge with nestedsortable
        if (this.targetID) {
            li.modelId = this.targetID;
            var item = diathink.OutlineNodeModel.findOrCreate(this.targetID);
        } else {
            // if view is rendered without a model
            // {text: this.options.lineText}; // from list
        }
        li = parentView.cloneObject(li, item);
        li.value = item; // enables getting the value/contentBinding of a list item in a template view.
        li.parentView = parentView;
        li.setRootID(parentView.rootID);
        parentView.updateNestedLists(li);
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
    }


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
    options: {referenceID: null, lineText: "", transition: false},
    targetID: null,
    triggers:null,
    modelStatus:0,
    viewStatus:{},
    execModel: function () {
        if (this.modelStatus !== 0) {
            return;
        }
        this.modelStatus = -1;
        var reference = diathink.OutlineNodeModel.findOrCreate(this.options.referenceID);
        var collection = reference.parentCollection();
        var refrank = reference.rank();
        collection.add({
            text: this.options.lineText,
            children: null
        },{
            at: refrank+1
        });
        this.targetID = collection.at(refrank+1).cid;
        this.modelStatus = 1;
    },
    execView:function (outline, focus) {
        // var c = diathink.app.getConfig('outlineView');
        if (this.viewStatus[outline.rootID] !== undefined) {
            return;
        }
        if (typeof this.targetID !== 'string') {
            return;
        }
        this.viewStatus[outline.rootID] = 1;
        var viewID = diathink.OutlineNodeModel.findOrCreate(this.options.referenceID).views[outline.rootID].id;

        var parentView = M.ViewManager.getViewById(viewID).parentView;

        var li = this.newListItemView(parentView);
        $('#' + viewID).after(li.render());
        li.registerEvents();
        li.theme();
        if (typeof diathink.OutlineNodeModel.findOrCreate(this.targetID).views != 'object') {
            diathink.OutlineNodeModel.findOrCreate(this.targetID).views = {};
        }
        diathink.OutlineNodeModel.findOrCreate(this.targetID).views[outline.rootID] = li;
        this.viewStatus[outline.rootID] = 2;
        parentView.themeUpdate(); // is this necessary?
        if (focus) {
            $('#' + li.header.name.id).focus();
        }
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

