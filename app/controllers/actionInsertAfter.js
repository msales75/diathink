
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
    targetPlaceholder: {},
    sourcePlaceholder: {},
    queue: {},
    targetHeight: {},
    movingTarget: {},
    status: {},
    constructor: function(options) {
        this.options = _.extend({}, this.options, options);
        this.targetPlaceholder = {};
        this.sourcePlaceholder = {};
        this.queue = {};
        this.targetHeight = {};
        this.movingTarget = {};
        this.status = {
            sourceContext: 0,
            destContext: 0,
            log: 0,
            undobuttons: 0,
            sourceCollection: 0,
            targetCollection: 0,
            targetRank: 0,
            model: 0,
            dockAnim: 0,
            focus: 0,
            sourcePlace: {},
            destPlace: {},
            view: {},
            sourceAnim: {},
            destAnim: {}
        };
        return this;
    },
    addAsync: function(self, deps, f) {
        this.addQueue(self, deps, f, true);
    },
    addQueue: function(self, deps, f, async) {
        if (!async) {async=false;}
        if (typeof self === 'object') {
            if (this.queue[self[0]+':'+self[1]]!==undefined) {alert("Queue error"); return;}
            this.queue[self[0]+':'+self[1]] = [self, deps, f, async];
        } else {
            if (this.queue[self]!==undefined) {alert("Queue error"); return;}
            this.queue[self] = [self, deps, f, async];
        }
    },
    nextQueue: function() {
        // console.log("Running nextQueue");
        if (this.nextQueueScheduled) {
            clearTimeout(this.nextQueueScheduled);
        }
        // loop over the queue and start all items which can be started
        var i, j, deps, depj, self, self0, f, ready, n= 0, queue=this.queue;
        var that = this;
        for (i in queue) {

            if (this.queue[i]===undefined) {continue;}

            // never start the same job twice
            self = queue[i][0];
            if (typeof self === 'object') { // array
                self0 = this.status[self[0]];
                // console.log("Considering queue item "+i+" type="+self[0]+":"+self[1]);
                if (self0 && self0[self[1]]>0) {
                    // console.log("Aborting queue item "+i+" because already begun");
                    continue;
                }
            } else {
                // console.log("Considering queue item "+i+" type="+self);
                if (this.status[self]>0) {
                    // console.log("Aborting queue item "+i+" because already begun");
                    continue;
                }
            }

            deps = queue[i][1];
            f = queue[i][2];
            ready=1;
            // console.log("Checking dependencies for "+i+": "+deps.join(','));
            for (j=0; j<deps.length; ++j) {
                if (typeof deps[j] === 'object') { // a dependency-array
                    depj = this.status[deps[j][0]];
                    if (!(depj && (depj[deps[j][1]]===2))) {
                        // console.log("Postponing "+i+" because haven't met: "+deps[j][0]+":"+deps[j][1]);
                        ready=0; break;
                    }
                } else { // a simple/string dependency
                    if (!(this.status[deps[j]]===2)) {
                        // console.log("Postponing "+i+" because haven't met: "+deps[j]);
                        ready=0; break;
                    }
                }
            }
            if (ready) {
                ++n;
                // remove self from queue
                this.execQueue(i);
            }
        }
        if (n>0) {
            this.nextQueueScheduled = setTimeout(function() {
                that.nextQueue();
            }, 0);
        }
    },
    execQueue: function(i) {
        var q, that = this;
        q = this.queue[i];
        // console.log("Scheduling "+i);
        if (typeof q[0] === 'object') {
            that.status[q[0][0]][q[0][1]] = 1;
        } else {
            that.status[q[0]] = 1;
        }
        setTimeout(function() {
            // console.log("Removing from queue item "+i);
            delete that.queue[i];
        }, 0);
        setTimeout(function() {
            // console.log("Updating status of item "+i+"before execution");
            // console.log("Executing "+i);
            (q[2])();
            if (!q[3]) { // unless it ends asynchronously like an animation
                // console.log("Updating status after finishing non-async item "+i);
                if (typeof q[0] === 'object') {
                    that.status[q[0][0]][q[0][1]] = 2;
                } else {
                    that.status[q[0]] = 2;
                }
                that.nextQueue();
            }
        }, 0);
    },
    exec:function (options) {
        var o, i, destViews, sourceViews, sourceAnims, destAnims;
        _.extend(this.options, options);
        o = this.options;
        var self = this;
        this.timestamp = (new Date()).getTime();
        this.undone = false;
        // before changing model, start preview animation
        this.addQueue('sourceContext', [], function() {
            self.getOldContext();
        });
        this.addQueue('destContext', [], function() {
            self.getNewContext();
        });
        var outlines = diathink.OutlineManager.outlines;
        if (!o.excludeAllViews) {
            for (i in outlines) {
                if (o.excludeView && (o.excludeView === i)) continue;
                this.preview(outlines[i], o.dragView===i);
            }
        }

        this.addQueue('log', ['sourceContext', 'destContext'], function() {
            diathink.UndoController.log(self);
        });
        // todo: assumptions and issue-handling
        this.execModel();

        if (!o.excludeAllViews) {
            for (i in outlines) {
                if (o.excludeView && (o.excludeView === i)) continue;
                this.execView(outlines[i], o.focusView===i);
            }
        }

        // todo: increase undo-dependencies
        this.addQueue('undobuttons', ['model'],
            function() {diathink.UndoController.refreshButtons();});

        // diathink.validateMVC();
        this.nextQueue();
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
        // diathink.validateMVC();
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
    restoreContext: function() {
        var target, collection, rank, oldCollection;
        var that = this;
        this.addQueue('sourceCollection', ['targetCreate'], function() {
            target = that.getModel(that.options.targetID);
            oldCollection = target.parentCollection();
        });
        this.addQueue('sourceModel', ['sourceCollection'], function() {
            if (oldCollection != null) { // if it's in a collection
                oldCollection.remove(target);
            }
        });
        this.addQueue('targetCollection', ['sourceModel'], function() {
            var context;
            if (that.undone) {
                context = that.oldContext;
            } else {
                context = that.newContext;
            }
            if (context != null) { // if there was a prior location to revert to
                target.deleted = false;
                if (context.parent != null) {
                    collection = that.getModel(context.parent).get('children');
                } else {
                    collection = diathink.data;
                }
            } else {
                target.deleted = true;
            }
        });
        this.addQueue('targetRank', ['targetCollection'], function() {
            var context;
            if (that.undone) {
                context = that.oldContext;
            } else {
                context = that.newContext;
            }
            if (context != null) {
                if (context.prev === null) {
                    rank = 0;
                } else {
                    rank = that.getModel(context.prev).rank()+1;
                }
            }
        });
        this.addQueue('model', ['targetRank'], function() {
            var context;
            if (that.undone) {
                context = that.oldContext;
            } else {
                context = that.newContext;
            }
            if (context != null) {
                collection.add(target, {at: rank});
            } else {
                target.set({parent: null});
            }
        });
    },
    preview:function (outline, dragView) {
        var that = this;
            // todo: for non-dragged targets, add fade-out on mousedown in nestedSortable.
        this.addQueue(['sourcePlace', outline.rootID], ['sourceContext'], function() {
            if (that.options.targetID) {
                var target = that.getView(that.options.targetID, outline.rootID);
                // vanish if not already hidden & shrink over 80ms
                var oldHeight = $('#'+target.id).css('height');
                var placeholder = $('<div></div>').addClass('li-placeholder').css('height',oldHeight);
                var oldTarget = $('#'+target.id).addClass('drag-hidden').replaceWith(placeholder);
                that.targetHeight[outline.rootID] = oldHeight;
                that.sourcePlaceholder[outline.rootID] = placeholder.get(0);
                that.movingTarget[outline.rootID] = oldTarget.get(0);
            }
        });
        this.addAsync(['sourceAnim', outline.rootID], [['sourcePlace', outline.rootID]], function() {
            if (that.sourcePlaceholder[outline.rootID]) {
                $(that.sourcePlaceholder[outline.rootID]).animate({
                    height: 0
                }, 200, function() {
                    // console.log("Updating status after finishing async sourceAnim:"+outline.rootID);
                    that.status.sourceAnim[outline.rootID] = 2;
                    that.nextQueue();
                });
            } else {
                that.status.sourceAnim[outline.rootID] = 2;
                that.nextQueue();
            }
        });
        // ready for removal, let model run now.
        // create preview-spacer in the right spot
        this.addQueue(['destPlace', outline.rootID], ['destContext', ['sourcePlace', outline.rootID]], function() {
            if (that.newContext) {
                var place = $('<div></div>').addClass('li-placeholder');
                that.targetPlaceholder[outline.rootID] = place.get(0);
                if (that.newContext.next) {
                    place.insertBefore('#'+that.getView(that.newContext.next, outline.rootID).id);
                } else if (that.newContext.prev) {
                    place.insertAfter('#'+that.getView(that.newContext.prev, outline.rootID).id);
                } else if (that.newContext.parent) {
                    place.appendTo('#'+that.getView(that.newContext.parent, outline.rootID).id+' > ul');
                }
            }
        });

        this.addAsync(['destAnim', outline.rootID], [['destPlace', outline.rootID]], function() {
            if (that.targetPlaceholder[outline.rootID]) {
                $(that.targetPlaceholder[outline.rootID]).animate({height: that.targetHeight[outline.rootID]}, 200, function() {
                    // console.log("Updating status after finishing async destAnim:"+outline.rootID);
                    that.status.destAnim[outline.rootID] = 2;
                    that.nextQueue();
                });
            } else {
                that.status.destAnim[outline.rootID] = 2;
                that.nextQueue();
            }
        });
        //  todo: for non-docking, start fade-in after restoreContext before focus
        // dock the dragged-helper
        if (diathink.helper && dragView) {
            this.addAsync('dockAnim', [['destPlace', outline.rootID], ['sourcePlace', outline.rootID]], function () {
                // Is destPlace for this view above or below source?
                var source = $(that.sourcePlaceholder[outline.rootID]).offset();
                var cur = $(that.targetPlaceholder[outline.rootID]).offset();
                if (cur.top > source.top) {cur.top -= Number(that.targetHeight[outline.rootID].replace(/px/,''));}
                // todo: placeholder may move during animation
                $(diathink.helper).animate({
                    left: cur.left,
                    top: cur.top
                }, 200, function() {
                    // console.log("Updating status after finishing async dockAnim");
                    $(document.body).removeClass('drop-mode');
                    $(diathink.helper).remove();
                    diathink.helper = null;
                    that.status.dockAnim = 2;
                    that.nextQueue();
                });
            });
        }
    },
    restoreViewContext: function(outline) {
        var that = this;
        this.addQueue(['view', outline.rootID], ['model', ['sourceAnim', outline.rootID], ['destAnim', outline.rootID]], function() {
            var collection, rank;
            var context, li, elem, oldspot, neighbor, neighborType, parent, createTarget=false;

            if (that.undone) {
                context = that.oldContext;
            } else {
                context = that.newContext;
            }
            // (1) does target exist in view, or does it need to be created
            // (2) will destination exist in view, or does it need to be deleted
            // (3) is destination at top-level of view, with undefined parent

            // target is a view here.
            var target = that.getView(that.options.targetID, outline.rootID);
            if (target!=null) {
                oldspot = that._saveOldSpot(target);
                neighbor = oldspot.obj;
                neighborType = oldspot.type;
            }

            // get parent listview; unless context is outside view then null
            if (context != null) {
                if (context.parent != null) {
                    var parent = that.getView(context.parent, outline.rootID);
                    if (parent != null) {
                        parent = parent.children;
                    } else { // parent is outside view, is it one level or more?
                        if (that.getModel(context.parent).get('children') ===
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

            if (context === null) {
                if (target != null) {target.destroy();}
                // destroy() also detaches view-reference from model
            } else { // undo-move/edit
                // get views corresponding to context
                if (target == null) { // create target
                    target = that.newListItemView(parent);
                    // todo: add text in?
                    target.value.setView(target.rootID, target);
                    elem = target.render();
                    createTarget = true;
                } else { // move
                    if (that.movingTarget[outline.rootID] && that.movingTarget[outline.rootID].id === target.id) {
                        elem = $(that.movingTarget[outline.rootID]);
                        that.movingTarget[outline.rootID] = undefined;
                    } else {
                        elem = $('#'+target.id).detach();
                    }
                    // restore height if it was lost
                    elem.css('height','').removeClass('drag-hidden');
                    target.parentView = parent;
                }

                // put elem into context
                // this cleans up destination-placeaholder; what about source-placeholder?
                //   it could vanish automatically?
                if (that.targetPlaceholder[outline.rootID]) {
                    $(that.targetPlaceholder[outline.rootID]).replaceWith(elem).remove();
                } else {
                    if (context.prev == null) {
                        var parentElem = $('#'+parent.id);
                        parentElem.prepend(elem);
                    } else {
                        var prevElem = $('#'+that.getView(context.prev, outline.rootID).id);
                        prevElem.after(elem);
                    }
                }

                if (createTarget) {
                    target.registerEvents(); // should phase-out with event-delegation
                    parent.themeUpdate(); // hack to theme list-item; could be optimized more
                    target.theme(); // add classes and if there is content, fixHeight
                    $('#'+target.id).addClass('leaf').addClass('expanded');
                }

                // fix target's top/bottom corners
                target.themeFirst(); // could check if this two are strictly necessary
                target.themeLast();

                // fixup new neighborhood
                if (context.next && (context.prev == null)) {
                    $('#'+target.id).next().removeClass('ui-first-child');
                }
                if (context.prev && (context.next == null)) {
                    $('#'+target.id).prev().removeClass('ui-last-child');
                }
                if ((context.prev==null)&&(context.next==null)) {
                    target.parentView.parentView.themeParent();
                }
            }
            // remove source-placeholder
            if (that.sourcePlaceholder[outline.rootID]) {
                $(that.sourcePlaceholder[outline.rootID]).remove();
                that.sourcePlaceholder[outline.rootID] = undefined;
            }

            if (neighbor) { // fixup old location
                var neighborElem = $('#'+neighbor.id);
                if (neighborType==='next') {
                    var prev = neighborElem.prev('li');
                    if (prev.length===0) {
                        neighborElem.addClass('ui-first-child');
                    }
                } else if (neighborType==='prev') {
                    var next = neighborElem.next('li');
                    if (next.length===0) {
                        neighborElem.addClass('ui-last-child');
                    }
                } else if (neighborType==='parent') {
                    neighbor.themeParent();
                }
            }
        });
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
        var type = 'next';
        var elem;
        if (this.movingTarget[view.rootID] && (this.movingTarget[view.rootID].id === view.id)) {
            elem = $(this.sourcePlaceholder[view.rootID]);
        } else {
            elem = $('#'+view.id);
        }
        var oldspot = elem.next('li');
        if (oldspot.length===0) {
            oldspot = elem.prev('li');
            type = 'prev';
        }
        if (oldspot.length>0) {
            return {type: type, obj: M.ViewManager.getViewById(oldspot.attr('id'))};
        } else {
            if (view.parentView.parentView && view.parentView.parentView.type==='M.ListItemView') {
                return {type: 'parent', obj: view.parentView.parentView};
            } else {
                return null;
            }
        }
    },
    getOldContext: function() {
        if (! this.options.targetID) {
            this.oldContext = null;
        } else {
            if (! this.options.redo) {
                this.oldContext = this.getContextAt(this.options.targetID);
            }
        }
    },
    execModel: function () {
        var that = this;
        this.addQueue('targetCreate', ['log'], function() {
            if (!that.options.targetID) {
                var target = new diathink.OutlineNodeModel({text: that.options.lineText, children: null});
                that.options.targetID = target.cid;
            }
        });
        this.restoreContext(this.newContext);
    },
    execView:function (outline, focus) {
        var that = this;
        this.restoreViewContext(outline);
        if (focus) {
            this.addQueue('focus', [['destAnim', outline.rootID], ['view', outline.rootID]], function() {
                $('#' + that.getView(that.options.targetID, outline.rootID).header.name.text.id).focus();
            });
        }
        return;
    },
    undoModel: function () {
        this.restoreContext(this.oldContext);
    },
    undoView:function (outline, focus) {
        this.restoreViewContext(outline);
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
        // console.log("Checking text change for id="+id);
        var value = $('#'+id).val();
        var model = M.ViewManager.findViewById(id).parentView.parentView.parentView.value;
        if (model.get('text') !== value) {
            //console.log("TextAction for id="+id+"; model="+
              //  model.cid+" with value="+$('#'+id).val());
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
    getOldContext: function() {},
    getNewContext: function() {},
    preview: function() {},
    execModel: function () {
        var that = this;
        that.addQueue('model', ['log'], function() {
            var target= that.getModel(that.options.targetID);
            that.oldText = target.get('text');
            target.set('text', that.options.text);
        });
    },
    execView:function (outline, focus) {
        var that = this;
        this.addQueue(['view', outline.rootID], ['model'], function() {
            var target = that.getView(that.options.targetID, outline.rootID);
            if (target != null) {
                target.header.name.text.value = that.options.text;
                // console.log("Updating view "+target.header.name.text.id+" to value "+this.options.text);
                $('#'+target.header.name.text.id).val(that.options.text);
                target.header.name.text.themeUpdate();
            }
        });
    },
    undoModel: function () {
        var target = this.getModel(this.options.targetID);
        target.set('text', this.oldText);
    },
    undoView:function (outline, focus) {
        var target = this.getView(this.options.targetID, outline.rootID);
        if (target != null) {
            target.header.name.text.value = this.oldText;
            // console.log("Updating view "+target.header.name.text.id+" to value "+this.oldText);
            $('#'+target.header.name.text.id).val(this.oldText);
            target.header.name.text.themeUpdate();
        }
    }
});
