
// delete action and edit-action

diathink.Action = Backbone.RelationalModel.extend({
    type:"Action",
    instance: 0,
    user: 0,
    timestamp: null,
    options:{},
    oldContext:null,
    newContext:null,
    triggers:null,
    undone: false,
    lost: false,
    constructor: function(options) {
        this.options = _.extend({}, this.options, options);
        return this;
    },
    preview:function () {
        // no instantiation or parameter-saving
    },
    exec:function (options) {
        var o, i;
        _.extend(this.options, options);
        o = this.options;
        this.timestamp = (new Date()).getTime();

        this.undone = false;
        diathink.UndoController.log(this);

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
        diathink.UndoController.refreshButtons();
    },
    getModel: function(id) {
        return Backbone.Relational.store.find(diathink.OutlineNodeModel, id);
    },
    getView: function(id, rootid) {
        var model = this.getModel(id);
        if (model.views == null) {return null;}
        return model.views[rootid];
    },
    undo:function (options) {
        var o, i;
        _.extend(this.options, options);
        o = this.options;
        o.undo = true;
        this.undoTimestamp = (new Date()).getTime();
        this.undone = true;
        var outlines = diathink.OutlineManager.outlines;
        for (i in outlines) {
            this.undoView(outlines[i], focus);
        }
        this.undoModel();
        diathink.UndoController.refreshButtons();
    },
    // todo: should make node-model a doubly-linked list without relying on collection rank?
    getContext: function(collection, rank) {
        var context = {};
        if (rank===0) {
            context.prev = null;
        } else {
            context.prev = collection.at(rank-1).cid;
        }
        if (rank === collection.length-1) {
            context.next = null;
        } else {
            context.next = collection.at(rank+1).cid;
        }
        if (collection.at(rank).get('parent')) {
            context.parent = collection.at(rank).get('parent').cid;
        } else {
            context.parent = null;
        }
        return context;
    },
    restoreContext: function() {
        var model = this.getModel(this.options.targetID);
        var collection, rank, context = this.oldContext;
        var oldCollection = model.parentCollection();
        if (oldCollection != null) { // if it's in a collection
            oldCollection.remove(model);
        }
        if (context != null) { // if there was a prior location to revert to
            model.deleted = false;
            if (context.parent != null) {
                collection = this.getModel(context.parent).get('children');
            } else {
                collection = diathink.data;
            }
            if (context.prev === null) {
                rank = 0;
            } else {
                rank = this.getModel(context.prev).rank();
            }
            collection.add(model, {at: rank+1});
        } else { // mark it as deleted
            model.deleted = true;
            model.views = null; // todo: should we wait to negate views?
            model.set({parent: null});
        }
    },
    restoreViewContext: function(outline) {
        var collection, rank;
        var context = this.oldContext;
        var li, elem, neighbor, parent, themeparent=false;
        var target = this.getView(this.options.targetID, outline.rootID);
        if (target!=null) { // if target wasn't deleted
            neighbor = this._saveOldSpot(target);
        }
        if (context === null) { // undo creation
            if (target != null) {target.destroy();}
        } else { // undo-move/edit
            // get views corresponding to context
            if (context.parent != null) {
                parent = this.getView(context.parent, outline.rootID).children;
            } else {
                parent = M.ViewManager.getViewById(outline.rootID);
            }
            if (target == null) {
                // undo deletion - test later; target doesn't exist in this case
                target = this.newListItemView(parent);
                // add text in?
                target.value.setView(target.rootID, target);
                elem = target.render();
                themeparent = true;
            } else { // undo move
                elem = $('#'+target.id).detach();
                target.parentView = parent;
            }

            // put elem into context
            if (context.prev == null) {
                $('#'+parent.id).prepend(elem);
            } else {
                $('#'+this.getView(context.prev, outline.rootID).id).after(elem);
            }
            if (themeparent) {
                parent.themeUpdate(); // hack to theme list-item
            }
            target.theme(); // theme new lcoation
        }
        if (neighbor) {neighbor.theme();} // theme old location

        // re-create view, it shouldn't ever exist
        // todo: need to add this to validation constraints
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
},{ // static functions
    createAndExec:function (options) { // create a new action object
        var action = new this(options);
        action.exec();
        return action;
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

// commuting operations don't have to be undone/redone - optimization

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
        var newrecord;
        // todo: re-create the item with the same cid instead of retrieving it from store
        if (this.options.targetID != null) {
            newrecord = this.getModel(this.options.targetID);
            newrecord.deleted = false;
        } else {
            newrecord = {text: this.options.lineText, children: null};
        }
        collection.add(newrecord,{at: rank});
        this.options.targetID = collection.at(rank).cid;
        // we don't really need the new context now, do we?  except for warnings
        // this.newContext= this.getContext(collection, rank);
    },
    execView:function (outline, focus) {
        var reference = this.getView(this.options.referenceID, outline.rootID);
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
    undoModel: function () {
        this.restoreContext();
    },
    undoView:function (outline, focus) {
        this.restoreViewContext(outline);
    },
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
        // store original location for undo
        var oldCollection = target.parentCollection();
        this.oldContext = this.getContext(oldCollection, target.rank());
        oldCollection.remove(target);
        var rank = reference.rank();
        if (this.type==="MoveAfterAction") {
            rank = rank+1;
        } else if (this.type==="MoveBeforeAction") {}
        reference.parentCollection().add(target,{at: rank});
    },
    execView:function (outline, focus) {
        var target = this.getView(this.options.targetID, outline.rootID);
        var reference = this.getView(this.options.referenceID, outline.rootID);
        // remember old sibling of target for retheming
        var oldspot = this._saveOldSpot(target);
        var targetParent = target.parentView;
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
    undoModel:function() {
        this.restoreContext();
    },
    undoView:function (outline) {
        this.restoreViewContext(outline);
    }
});

diathink.MoveBeforeAction = diathink.MoveAfterAction.extend({
    type:"MoveBeforeAction"
});

diathink.MoveIntoAction = diathink.Action.extend({
    type:"MoveIntoAction",
    options: {targetID: null, referenceID: null, transition: false},
    execModel: function () {
        var target= this.getModel(this.options.targetID);
        var reference = this.getModel(this.options.referenceID);
        var oldCollection = target.parentCollection();
        this.oldContext = this.getContext(oldCollection, target.rank());
        oldCollection.remove(target);
        reference.get('children').push(target);
    },
    execView:function (outline, focus) {
        var target = this.getView(this.options.targetID, outline.rootID);
        var reference = this.getView(this.options.referenceID, outline.rootID);
        var oldspot = this._saveOldSpot(target);
        $('#'+target.id).detach().appendTo($('#'+reference.id).children('div').children('div').children('a').children('ul'));
        target.parentView = reference.children;
        target.theme();
        if (oldspot) {oldspot.theme();}
        if (focus) {
            $('#' + target.header.name.id).focus();
        }
    },
    undoModel: function () {
        this.restoreContext();
    },
    undoView:function (outline, focus) {
        this.restoreViewContext(outline);
    }
});

// todo: merge outdent with moveafter action?
diathink.OutdentAction = diathink.Action.extend({
    type:"OutdentAction",
    options: {targetID: null, referenceID: null, transition: false},
    execModel: function () {
        var target= this.getModel(this.options.targetID);
        var reference = this.getModel(this.options.referenceID);
        var oldCollection = target.parentCollection();
        this.oldContext = this.getContext(oldCollection, target.rank());
        reference.get('children').remove(target);
        var collection = reference.parentCollection();
        var rank = reference.rank();
        collection.add(target, {at: rank+1});
    },
    execView:function (outline, focus) {
        var target = this.getView(this.options.targetID, outline.rootID);
        var reference = this.getView(this.options.referenceID, outline.rootID);
        var oldspot = this._saveOldSpot(target);
        $('#'+target.id).detach().insertAfter('#'+reference.id);
        target.parentView = reference.parentView;
        target.theme();
        if (oldspot) {oldspot.theme();}
        if (focus) {
            $('#' + target.header.name.id).focus();
        }
    },
    undoModel: function () {
        this.restoreContext();
    },
    undoView:function (outline, focus) {
        this.restoreViewContext(outline);
    }
});

diathink.ActionCollection = Backbone.Collection.extend({
    model: diathink.Action
});

diathink.DeleteAction = diathink.Action.extend({
    type:"DeleteAction",
    options: {targetID: null, transition: false},
    execModel: function () {
        var target= this.getModel(this.options.targetID);
        if (target.get('children').length>0) {return false;} // cannot delete node with children
        var oldCollection = target.parentCollection();
        this.oldContext = this.getContext(oldCollection, target.rank());
        oldCollection.remove(target);
        target.deleted = true;
    },
    execView:function (outline, focus) {
        var target = this.getView(this.options.targetID, outline.rootID);
        var oldspot = this._saveOldSpot(target);
        var targetParent = target.parentView;
        $('#'+target.id).remove();
        target.value.clearView(outline.rootID);
        if (target != null) {target.destroy();}
        if (oldspot) {oldspot.theme();}
    },
    undoModel:function() {
        this.restoreContext();
    },
    undoView:function (outline) {
        this.restoreViewContext(outline);
    }
});

diathink.TextAction= diathink.Action.extend({
    type:"TextAction",
    options: {targetID: null, text: null, transition: false},
    execModel: function () {
        var target= this.getModel(this.options.targetID);
        this.oldText = target.get('text');
        target.set('text', this.options.text);
    },
    execView:function (outline, focus) {
        var target = this.getView(this.options.targetID, outline.rootID);
        target.header.name.value = this.options.text;
        $('#'+target.id+' > div > div > a > div > div > input').val(this.options.text);
    },
    undoModel: function () {
        var target = this.getModel(this.options.targetID);
        target.set('text', this.oldText);
    },
    undoView:function (outline, focus) {
        var target = this.getView(this.options.targetID, outline.rootID);
        target.header.name.value = this.oldText;
        $('#'+target.id+' > div > div > a > div > div > input').val(this.oldText);
    }
});
