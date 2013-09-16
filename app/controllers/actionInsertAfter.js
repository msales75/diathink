
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
        diathink.validateMVC();
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
        this.undoModel();
        var outlines = diathink.OutlineManager.outlines;
        for (i in outlines) {
            this.undoView(outlines[i], focus);
        }
        diathink.UndoController.refreshButtons();
        diathink.validateMVC();
    },
    // todo: should make node-model a doubly-linked list without relying on collection rank?
    getContextAt: function(id) {
        var model = this.getModel(id);
        var collection= model.parentCollection();
        var rank = model.rank();
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
    // return the context for an item inserted after id
    getContextAfter: function(id) {
        var context;
        var reference = this.getModel(id);
        var collection = reference.parentCollection();
        var refrank = reference.rank();
        var parent = reference.get('parent');
        if (parent!=null) {
            context = {parent: parent.cid};
        } else {
            context = {parent: null};
        }
        context.prev = id;
        if (refrank===collection.length-1) {
            context.next = null;
        } else {
            context.next = collection.at(refrank+1).cid;
        }
        return context;
    },
    // return the context for an item inserted before id
    getContextBefore: function(id) {
        var context;
        var reference = this.getModel(id);
        var collection = reference.parentCollection();
        var refrank = reference.rank();
        var parent = reference.get('parent');
        if (parent!=null) {
            context = {parent: parent.cid};
        } else {
            context = {parent: null};
        }
        context.next = id;
        if (refrank===0) {
          context.prev = null;
        } else {
          context.prev = collection.at(refrank-1).cid;
        }
        return context;
    },
    // return the context for an item inserted inside id, at end of list
    getContextIn: function(id) {
        var reference = diathink.OutlineNodeModel.getById(id);
        var collection = reference.get('children');
        context = {parent: id, next: null};
        if (collection.length===0) {
            context.prev = null;
        } else {
            context.prev = collection.at(collection.length-1).cid;
        }
        return context;
    },
    newModel: function() {
        var target = new diathink.OutlineNodeModel({text: this.options.lineText, children: null});
        this.options.targetID = target.cid;
        return target;
    },
    restoreContext: function(context) {
        var target = this.getModel(this.options.targetID);
        var collection, rank;
        var oldCollection = target.parentCollection();
        if (oldCollection != null) { // if it's in a collection
            oldCollection.remove(target);
        }
        if (context != null) { // if there was a prior location to revert to
            target.deleted = false;
            if (context.parent != null) {
                collection = this.getModel(context.parent).get('children');
            } else {
                collection = diathink.data;
            }
            if (context.prev === null) {
                rank = 0;
            } else {
                rank = this.getModel(context.prev).rank()+1;
            }
            collection.add(target, {at: rank});
        } else { // mark it as deleted
            target.deleted = true;
            // target.views = null; // todo: negate views individually
            target.set({parent: null});
        }
    },
    restoreViewContext: function(context, outline) {
        var collection, rank;
        var li, elem, neighbor, parent, themeparent=false;

        // (1) does target exist in view, or does it need to be created
        // (2) will destination exist in view, or does it need to be deleted
        // (3) is destination at top-level of view, with undefined parent

        var target = this.getView(this.options.targetID, outline.rootID);
        if (target!=null) { // if target wasn't deleted from this view
            neighbor = this._saveOldSpot(target);
        }

        // if context is outside view, then set to null
        if (context != null) {
            if (context.parent != null) {
                var parent = this.getView(context.parent, outline.rootID);
                if (parent != null) {
                    parent = parent.children;
                } else { // parent is outside view, is it one level or more?
                    if (this.getModel(context.parent).get('children') ===
                        M.ViewManager.getViewById(outline.rootID).value) {
                        parent = M.ViewManager.getViewById(outline.rootID);
                    } else { // context is out of scope
                        context = null;
                        parent = null;
                    }
                }
            } else { // outline-root diathink.data
                if (M.ViewManager.getViewById(outline.rootID).value === diathink.data) {
                    parent = M.ViewManager.getViewById(outline.rootID);
                } else {
                    context = null;
                    parent = null;
                }
            }
        }

        if (context === null) { // undo creation
            if (target != null) {target.destroy();}
              // destroy() also detaches view-reference from model
        } else { // undo-move/edit
            // get views corresponding to context
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
                target.registerEvents();
                parent.themeUpdate(); // hack to theme list-item
            }
            target.theme(); // theme new lcoation
        }
        if (neighbor) {neighbor.theme();} // theme old location

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
    execModel: function () {
        if (! this.options.targetID) {
            var target = new diathink.OutlineNodeModel({text: this.options.lineText, children: null});
            this.options.targetID = target.cid;
            this.oldContext = null;
        } else {
            if (! this.options.redo) {
                this.oldContext = this.getContextAt(this.options.targetID);
            }
        }
        this.getNewContext();
        this.restoreContext(this.newContext);
    },
    execView:function (outline, focus) {
        this.restoreViewContext(this.newContext, outline);
        if (focus) {
            $('#' + this.getView(this.options.targetID, outline.rootID).header.name.id).focus();
        }
        return;
    },
    undoModel: function () {
        this.restoreContext(this.oldContext);
    },
    undoView:function (outline, focus) {
        this.restoreViewContext(this.oldContext, outline);
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
    },
    checkTextChange:function(id) {
        var value = $('#'+id).val();
        var model = M.ViewManager.findViewById(id).parentView.parentView.value;
        if (model.get('text') !== value) {
            diathink.TextAction.createAndExec({
                targetID: model.cid,
                text: $('#'+id).val()
            });
        }
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
    getNewContext: function() {
        this.newContext = this.getContextAfter(this.options.referenceID);
    }
});

diathink.InsertBeforeAction = diathink.Action.extend({
    type:"InsertBeforeAction",
    options: {targetID: null, referenceID: null, lineText: "", transition: false},
    getNewContext: function() {
        this.newContext = this.getContextBefore(this.options.referenceID);
    }
});

diathink.MoveAfterAction = diathink.Action.extend({
    type:"MoveAfterAction",
    options: {targetID: null, referenceID: null, transition: false},
    getNewContext: function() {
        this.newContext = this.getContextAfter(this.options.referenceID);
    }
});

diathink.MoveBeforeAction = diathink.Action.extend({
    type:"MoveBeforeAction",
    options: {targetID: null, referenceID: null, transition: false},
    getNewContext: function() {
        this.newContext = this.getContextBefore(this.options.referenceID);
    }
});

diathink.MoveIntoAction = diathink.Action.extend({
    type:"MoveIntoAction",
    options: {targetID: null, referenceID: null, transition: false},
    getNewContext: function() {
        this.newContext = this.getContextIn(this.options.referenceID);
    }
});

// todo: merge outdent with moveafter action?
diathink.OutdentAction = diathink.Action.extend({
    type:"OutdentAction",
    options: {targetID: null, referenceID: null, transition: false},
    getNewContext: function() {
        this.newContext = this.getContextAfter(this.options.referenceID);
    }
});

diathink.ActionCollection = Backbone.Collection.extend({
    model: diathink.Action
});

diathink.DeleteAction = diathink.Action.extend({
    type:"DeleteAction",
    options: {targetID: null, transition: false},
    getNewContext: function() {
        this.newContext = null;
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
        if (target != null) {
            target.header.name.value = this.options.text;
            $('#'+target.id+' > div > div > a > div > div > input').val(this.options.text);
        }
    },
    undoModel: function () {
        var target = this.getModel(this.options.targetID);
        target.set('text', this.oldText);
    },
    undoView:function (outline, focus) {
        var target = this.getView(this.options.targetID, outline.rootID);
        if (target != null) {
            target.header.name.value = this.oldText;
            $('#'+target.id+' > div > div > a > div > div > input').val(this.oldText);
        }
    }
});
