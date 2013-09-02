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
    modelStatus: 0,
    viewStatus: {},
    init: function(options) {
        _.extend(this, {
            options: _.extend({}, this.options, options),
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
        // return Backbone.RelationalModel.get(modelId).views[outline];
    },
    // utility functions
    newListItemView:function (parentView) { // (id only if known)
        // todo: should more of this be in cloneObject?
        var templateView = parentView.listItemTemplateView;
        M.assert(templateView != null);
        templateView.events = templateView.events ? templateView.events : parentView.events;

        var li = templateView.design({cssClass: 'leaf'}); // todo -- merge with nestedsortable
        if (this.options.targetID) {
            li.modelId = this.options.targetID;
            var item = diathink.OutlineNodeModel.getById(this.options.targetID);
        } else {
            // if view is rendered without a model
            // {text: this.options.lineText}; // from list
        }
        // todo: listview() classes should be on li before it is cloned
        li = parentView.cloneObject(li, item);
        li.value = item; // enables getting the value/contentBinding of a list item in a template view.
        li.parentView = parentView;
        li.setRootID(parentView.rootID);
        parentView.updateNestedLists(li);
        return li;
    },

    _saveOldSpot: function(view) {
        var oldspot = $('#'+view.id).next('li');
        if (oldspot.length===0) {
            oldspot = $('#'+view.id).prev('li');
        }
        if (oldspot.length>0) {
            return M.ViewManager.getViewById(oldspot.attr('id'));
        } else {
            if (view.parentView.parentView && view.parentView.parentView.type==='M.ListItemView') {
                return view.parentView.parentView;
            } else {
                return null;
            }
        }
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
    options: {targetID: null, referenceID: null, lineText: "", transition: false},
    execModel: function () {
        var reference = diathink.OutlineNodeModel.getById(this.options.referenceID);
        var collection = reference.parentCollection();
        var refrank = reference.rank();
        var rank;
        if (this.type==="InsertAfterAction") {
            rank = refrank+1;
        } else if (this.type==="InsertBeforeAction") {
            rank = refrank;
        }
        collection.add({
            text: this.options.lineText,
            children: null
        },{
            at: rank
        });
        this.options.targetID = collection.at(rank).cid;
    },
    execView:function (outline, focus) {
        var reference = diathink.OutlineNodeModel.getById(this.options.referenceID).views[outline.rootID];
        var li = this.newListItemView(reference.parentView);
        if (this.type==="InsertAfterAction") {
            $('#' + reference.id).after(li.render());
        } else if (this.type==="InsertBeforeAction") {
            $('#' + reference.id).before(li.render());
        }
        li.registerEvents();
        li.theme();
        diathink.OutlineNodeModel.getById(this.options.targetID).setView(outline.rootID, li);
        reference.parentView.themeUpdate(); // todo: make this unecessary when li is cloned with theme
        if (focus) {
            $('#' + li.header.name.id).focus();
        }
    },
    undoView:function (view) {},
    validateView:function (view) {},
    validateModel: function() {}
});

diathink.InsertBeforeAction = diathink.InsertAfterAction.extend({
    type:"InsertBeforeAction"
});

diathink.MoveAfterAction = diathink.Action.extend({
    type:"MoveAfterAction",
    options: {targetID: null, referenceID: null, transition: false},
    execModel: function () {
        var target= diathink.OutlineNodeModel.getById(this.options.targetID);
        var reference = diathink.OutlineNodeModel.getById(this.options.referenceID);
        target.parentCollection().remove(target);
        var rank = reference.rank();
        if (this.type==="MoveAfterAction") {
            rank = rank+1;
        } else if (this.type==="MoveBeforeAction") {}
        reference.parentCollection().add(target,{at: rank});
    },
    execView:function (outline, focus) {
        var target = diathink.OutlineNodeModel.getById(this.options.targetID).views[outline.rootID];
        var reference = diathink.OutlineNodeModel.getById(this.options.referenceID).views[outline.rootID];
        // remember old sibling of target for retheming
        var oldspot = this._saveOldSpot(target);
        var targetParent = target.parentView;
        var rank = target.value.rank();
        if (this.type==="MoveAfterAction") {
            $('#'+target.id).detach().insertAfter('#'+reference.id);
        } else if (this.type==="MoveBeforeAction") {
            $('#'+target.id).detach().insertBefore('#'+reference.id);
        }
        target.parentView = reference.parentView;
        target.theme();
        if (oldspot) {oldspot.theme();}
        if (focus) {
            $('#' + target.header.name.id).focus();
        }
    },
    undoView:function (view) {}
});

diathink.MoveBeforeAction = diathink.MoveAfterAction.extend({
    type:"MoveBeforeAction"
});

diathink.MoveIntoAction = diathink.Action.extend({
    type:"MoveIntoAction",
    options: {targetID: null, referenceID: null, transition: false},
    execModel: function () {
        var target= diathink.OutlineNodeModel.getById(this.options.targetID);
        var reference = diathink.OutlineNodeModel.getById(this.options.referenceID);
        target.parentCollection().remove(target);
        reference.attributes.children.push(target);
    },
    execView:function (outline, focus) {
        var target = diathink.OutlineNodeModel.getById(this.options.targetID).views[outline.rootID];
        var reference = diathink.OutlineNodeModel.getById(this.options.referenceID).views[outline.rootID];
        var oldspot = this._saveOldSpot(target);
        $('#'+target.id).detach().appendTo($('#'+reference.id).children('div').children('div').children('a').children('ul'));
        target.parentView = reference.children;
        target.theme();
        if (oldspot) {oldspot.theme();}
        if (focus) {
            $('#' + target.header.name.id).focus();
        }
    },
    undoView:function (view) {}
});


diathink.OutdentAction = diathink.Action.extend({
    type:"OutdentAction",
    options: {targetID: null, referenceID: null, transition: false},
    execModel: function () {
        var target= diathink.OutlineNodeModel.getById(this.options.targetID);
        var reference = diathink.OutlineNodeModel.getById(this.options.referenceID);
        reference.attributes.children.remove(target);
        var collection = reference.parentCollection();
        var rank = reference.rank();
        collection.add(target, {at: rank+1});
    },
    execView:function (outline, focus) {
        var target = diathink.OutlineNodeModel.getById(this.options.targetID).views[outline.rootID];
        var reference = diathink.OutlineNodeModel.getById(this.options.referenceID).views[outline.rootID];
        var oldspot = this._saveOldSpot(target);
        $('#'+target.id).detach().insertAfter('#'+reference.id);
        target.parentView = reference.parentView;
        target.theme();
        if (oldspot) {oldspot.theme();}
        if (focus) {
            $('#' + target.header.name.id).focus();
        }
    },
    undoView:function (view) {}
});
