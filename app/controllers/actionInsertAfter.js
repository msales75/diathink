
// Flag for scroll
// todo: action defines focusID and stores oldFocus and newFocus in context.
// todo: handle focusID in context, and validate it.
// todo: undo-scroll (maybe focus)

diathink.Action = Backbone.RelationalModel.extend({
    type:"Action",
    indentSpeed: 80,
    createSpeed: 80,
    deleteSpeed: 80,
    placeholderSpeed: 160,
    dockSpeed: 160,
    constructor: function(options) {
        this.init();
        this.options = _.extend({}, this.options, options);
        return this;
    },
    init: function() {
        _.extend(this, {
            instance: 0,
            user: 0,
            timestamp: null,
            undone: false,
            lost: false,
            oldContext:null,
            newContext:null,
            subactions: [],
            oldViewCollapsed: {},
            // options: {},
            runtime: null // variables that initialize each time _exec is called
        });
        this.runinit();
    },
    runinit: function() {
        this.runtime = {
            nextQueueScheduled: null,
            activeHeight: {},
            activeElem: {},
            newPlaceholder: {},
            oldPlaceholder: {},
            queue: {},
            status: {
                context: 0,
                log: 0,
                undobuttons: 0,
                oldModelCollection: 0,
                oldModelRemove: 0,
                modelCreate: 0,
                newModelRank: 0,
                newModelAdd: 0,
                dockAnim: 0,
                focus: 0,
                end: 0,
                oldPlace: {},
                newPlace: {},
                oldPlaceAnim: {},
                newPlaceAnim: {},
                view: {}
            }
        }
    },
    addAsync: function(self, deps, f) {
        this.addQueue(self, deps, f, true);
    },
    addQueue: function(self, deps, f, async) {
        if (!async) {async=false;}
        if (typeof self === 'object') {
            if (this.runtime.queue[self[0]+':'+self[1]]!==undefined) {alert("Queued twice: "+self[0]+':'+self[1]); return;}
            this.runtime.queue[self[0]+':'+self[1]] = [self, deps, f, async];
        } else {
            if (this.runtime.queue[self]!==undefined) {alert("Queued twice: "+self); return;}
            this.runtime.queue[self] = [self, deps, f, async];
        }
    },
    nextQueue: function() {
        // console.log("Running nextQueue");
        if (this.runtime.nextQueueScheduled) {
            clearTimeout(this.runtime.nextQueueScheduled);
        }
        // loop over the queue and start all items which can be started
        var i, j, deps, depj, self, self0, f, ready, n= 0, queue=this.runtime.queue;
        var that = this;
        for (i in queue) {

            if (this.runtime.queue[i]===undefined) {continue;}

            // never start the same job twice
            self = queue[i][0];
            if (typeof self === 'object') { // array
                self0 = this.runtime.status[self[0]];
                // console.log("Considering queue item "+i+" type="+self[0]+":"+self[1]);
                if (self0 && self0[self[1]]>0) {
                    // console.log("Aborting queue item "+i+" because already begun");
                    continue;
                }
            } else {
                // console.log("Considering queue item "+i+" type="+self);
                if (this.runtime.status[self]>0) {
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
                    depj = this.runtime.status[deps[j][0]];
                    if (!(depj && (depj[deps[j][1]]===2))) {
                        // console.log("Postponing "+i+" because haven't met: "+deps[j][0]+":"+deps[j][1]);
                        ready=0; break;
                    }
                } else { // a simple/string dependency
                    if (!(this.runtime.status[deps[j]]===2)) {
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
            this.runtime.nextQueueScheduled = setTimeout(function() {
                that.nextQueue();
            }, 0);
        }
    },
    execQueue: function(i) {
        var q, that = this;
        q = this.runtime.queue[i];
        // console.log("Scheduling "+i);
        if (typeof q[0] === 'object') {
            that.runtime.status[q[0][0]][q[0][1]] = 1;
        } else {
            that.runtime.status[q[0]] = 1;
        }
        setTimeout(function() {
            // console.log("Removing from queue item "+i);
            delete that.runtime.queue[i];
        }, 0);
        setTimeout(function() {
            // console.log("Updating status of item "+i+"before execution");
            // console.log("Executing "+i);
            (q[2])();
            if (!q[3]) { // unless it ends asynchronously like an animation
                // console.log("Updating status after finishing non-async item "+i);
                if (typeof q[0] === 'object') {
                    that.runtime.status[q[0][0]][q[0][1]] = 2;
                } else {
                    that.runtime.status[q[0]] = 2;
                }
                that.nextQueue();
            }
        }, 0);
    },
    exec: function(options) {
        var i, rank, nsub;
        if (!options) {options = {};}
        console.log("Scheduling action "+this.type+" with undo="+options.undo+"; redo="+options.redo);
        if (options.redo) {options.undo = false;}
        if (!options.undo) {this.undone=false;}
        if (options.parentAction) {
            this.parentAction = options.parentAction;
        }

        // if this is undo/redo op, and there are subactions, queue those immediately.
        if (options.redo && (this.subactions.length>0)) {
            nsub = this.subactions.length;
            for (i=0; i<nsub; ++i) {
                rank = diathink.ActionManager.nextRedo();
                if (diathink.ActionManager.actions.at(rank) !== this.subactions[i].action) {
                    console.log("ERROR: Redoing wrong subaction");
                    debugger;
                }
                diathink.ActionManager.subRedo();
            }
        } else if (options.undo && (this.parentAction != null)) {
            nsub = this.parentAction.subactions.length;
            if (this !== this.parentAction.subactions[nsub-1].action) {
                console.log("ERROR: Last subaction in chain was not called first!");
                debugger;
            }
            for (i=0; i<nsub; ++i) {
                rank = diathink.ActionManager.nextUndo();
                if (i===0) {
                    if (diathink.ActionManager.actions.at(rank) !== this.parentAction) {
                        console.log("ERROR: Undoing something else when should be parentAction");
                        debugger;
                    }
                } else {
                    if (diathink.ActionManager.actions.at(rank) !== this.subactions[nsub-1-i].action) {
                        console.log("ERROR: Undoing wrong subaction");
                        debugger;
                    }
                }
                diathink.ActionManager.subUndo();
            }
        }

        this._exec(options);

        // todo: test if lastAction is where it should be
        // todo: test if undo/redo/undone parameters match up

    },
    validateOptions: function() {
        var o = this.options, v = this._validateOptions;
        if ((v.requireActive || o.undo || o.redo) && !o.activeID && (this.type !== 'RootAction')) {
            console.log("ERROR: Action "+this.type+" missing activeID");
            debugger;
        }
        if (v.requireReference && !o.referenceID) {
            console.log("ERROR: Action "+this.type+" missing referenceID");
            debugger;
        }
        if (!o.oldView || !o.newView) {
            console.log("ERROR: Action "+this.type+" missing oldView or newView");
            debugger;
        }
        if (o.oldView !== 'all') {
            if (!diathink.OutlineManager.outlines[o.oldView]) {
                console.log('ERROR: Action '+this.type+' has invalid oldView');
                debugger;
            }
        }
        if ((o.newView !== 'all')&&(o.newView!=='new'))  {
            if (!diathink.OutlineManager.outlines[o.newView]) {
                console.log('ERROR: Action '+this.type+' has invalid newView');
                debugger;
            }
        }

        if (o.anim) {}

        if (o.activeID) {
            var activeModel = this.getModel(o.activeID);
            if (!activeModel) {
                console.log('ERROR: invalid activeModel for activeID='+ o.activeID);
                debugger;
            }
            if (v.requireOld && !o.undo) {
                if (o.oldView !== 'all') {
                    if (!activeModel.views || !activeModel.views[o.oldView]) {
                        console.log('ERROR: No old-view found for activeID='+ o.activeID);
                        debugger;
                    }
                }
            }
            if (v.requireNew && o.undo) {
                if (o.newView !== 'all') {
                    if (!activeModel.views || !activeModel.views[o.newView]) {
                        console.log('ERROR: No new-view found for activeID='+ o.activeID);
                        debugger;
                    }
                }
            }
        }
        if (o.referenceID) {
            var refModel = this.getModel(o.referenceID);
            if (!refModel) {
                console.log('ERROR: invalid refModel for activeID='+ o.activeID);
                debugger;
            }
            // reference is only used in newView, not oldView
            if (v.requireNew || v.requireNewReference) {
                if (!refModel.views || !refModel.views[o.newView]) {
                    console.log('ERROR: No new-view found for referenceID='+ o.referenceID);
                    debugger;
                }
            }
            if (v.requireNewReference && o.undo) {
                if (o.newView !== 'all') {
                    if (!activeModel.views || !activeModel.views[o.newView]) {
                        if (! $('#'+refModel.views[o.newView].id).hasClass('collapsed')) {
                            console.log('ERROR: Missing newView for activeID='+ o.activeID);
                            debugger;
                        }
                    }
                }
            }
        }
    },
    validateOldContext: function() {
        var context, o = this.options;
        if ((o.anim==='dock')||(o.anim==='indent')) {
            if ((this.newContext == null)||(this.oldContext == null)) {
                console.log("ERROR: Anim="+ o.anim+" but old or new context is null");
                debugger;
            }
        }
        if (o.undo) {
            context = this.newContext;
            if (this.type==='DeleteAction') {
                if (context !== null) {
                    console.log("ERROR: DeleteAction undo with newContext-not-null");
                    debugger;
                }
                return;
            }
        } else {
            context = this.oldContext;
            if (this.type==='InsertAfterAction') {
                if (context !== null) {
                    console.log("ERROR: Insert action with oldContext not-null");
                    debugger;
                }
                return;
            }
        }
        this.validateContext(context);
    },
    validateNewContext: function() {
        // todo: verify that placeholders and helpers are all cleaned up,
        var context, o = this.options;
        if (o.undo) {
            context = this.oldContext;
            if (this.type==='InsertAfterAction') {
                if (context !== null) {
                    console.log("ERROR: Insert action with oldContext not-null");
                    debugger;
                }
                return;
            }
        } else {
            context = this.newContext;
            if (this.type==='DeleteAction') {
                if (context !== null) {
                    console.log("ERROR: DeleteAction undo with newContext-not-null");
                    debugger;
                }
                return;
            }
        }
        this.validateContext(context);
    },
    validateContext: function(context) {
        var o = this.options;
        // otherwise context must exist
        if (o.activeID != null) {
            var model = this.getModel(o.activeID);
            if (model.get('parent')) {
                if (context.parent !== model.get('parent').cid) {
                    console.log('ERROR: context.parent does not match');
                    debugger;
                }
            } else {
                if (context.parent !== null) {
                    console.log('ERROR: context.parent is not null');
                    debugger;
                }
            }
            var collection = model.parentCollection();
            var rank = model.rank();
            if (rank===0) {
                if (context.prev !== null) {
                    console.log('ERROR: context.prev is not null though rank=0')
                    debugger;
                }
            } else {
                if (context.prev !== collection.at(rank-1).cid) {
                    console.log('ERROR: context.prev does not match');
                    debugger;
                }
            }
            if (rank === collection.length-1) {
                if (context.next !== null) {
                    console.log('ERROR: context.next is not null');
                    debugger;
                }
            } else {
                if (context.next !== collection.at(rank+1).cid) {
                    console.log('ERROR: context.next does not match');
                    debugger;
                }
            }
        }
        // todo: put text, collapsed, focus into oldContext and newContext.
        // (and oldView and newView?)
        if (o.text) {
            // todo:
        }
        if (o.collapsed !== undefined) {
            // todo:
        }
        if (o.focus) {
            // todo:
        }
    },
    _exec:function (options) {
        var o, i, that = this;
        that.runinit();
        _.extend(that.options, options);
        o = that.options;
        this.validateOptions();
        if (o.undo) {
            console.log("Starting undo "+this.historyRank+': '+this.type);
        } else if (o.redo) {
            console.log("Starting redo "+this.historyRank+': '+this.type);
        } else {
            console.log("Starting action "+this.historyRank+': '+this.type);
        }

        // before changing model, start preview animation
        this.addQueue('context', [], function() {
            that.timestamp = (new Date()).getTime();
            // the queues must wait until this action is ready to go.
            if (!o.undo && !o.redo) {
                if (o.targetIsFocused) { // fix target here, if it depends on current focus
                    if (diathink.focused) {
                        that.options.activeID = M.ViewManager.getViewById(diathink.focused.id).parentView.parentView.value.cid;
                    }
                } else if (o.referenceIsFocused) {
                    if (diathink.focused) {
                        that.options.referenceID = M.ViewManager.getViewById(diathink.focused.id).parentView.parentView.value.cid;
                    }
                }
                that.getOldContext();
                that.getNewContext();
            }
            if (o.undo) {
                that.oldLocationExists = (that.newContext!=null);
            } else {
                that.oldLocationExists = (that.oldContext!=null);
            }
            that.validateOldContext();
        });
        this.addQueue('preDock', ['context'], function() {
            if (((that.options.anim==='indent')||(that.options.anim==='dock')) &&
                (!diathink.helper)) {
                // create virtual diathink.helper for animation
                var oldView = that.options.oldView;
                if (that.options.undo) {oldView = that.options.newView;}
                var activeView = that.getView(that.options.activeID, oldView);
                if (!activeView) { // no find item to dock, e.g. undoing drag-into collapse
                    return;
                }
                if ($('#'+activeView.id).length===0) {
                    console.log('ERROR: activeView exists with missing element');
                    debugger;
                }
                diathink.helper = $('#'+activeView.id)[0].cloneNode(true);
                diathink.helper.id = '';
                var drawlayer = $('#'+M.ViewManager.getCurrentPage().drawlayer.id);
                drawlayer[0].appendChild(diathink.helper);
                var offset = $('#'+activeView.id).offset();
                $(diathink.helper).css({
                    position: 'absolute',
                    left: offset.left+'px',
                    top: offset.top+'px',
                    width: $('#'+activeView.id)[0].clientWidth,
                    height: $('#'+activeView.id)[0].clientHeight
                });
                $(document.body).addClass('transition-mode');
            }
        });
        var outlines = diathink.OutlineManager.outlines;
        for (i in outlines) {
           this.preview(outlines[i]);
        }

        // todo: for non-docking, start fade-in after restoreContext before focus
        // dock the dragged-helper
        if ((that.options.anim==='dock')||(that.options.anim==='indent')) {
            var newView = that.options.newView;
            if (that.options.undo) {newView = that.options.oldView;}
            this.addAsync('dockAnim', [['newPlace', newView], ['oldPlace', newView]], function () {
                // Is newPlace for this view above or below source?
                if ((that.newContext == null)||(that.oldContext == null)) {
                    console.log("ERROR: docking attempted with null context");
                    debugger;
                }
                if (! that.runtime.newPlaceholder[newView]) { // nowhere to dock
                    $(document.body).removeClass('transition-mode');
                    diathink.helper.parentNode.removeChild(diathink.helper);
                    diathink.helper = null;
                    that.runtime.status.dockAnim = 2;
                    that.nextQueue();
                    return;
                }
                if (!diathink.helper) { // nothing to dock
                    that.runtime.status.dockAnim = 2;
                    that.nextQueue();
                    return;
                }
                var speed;
                if (that.options.anim==='dock') {speed = that.dockSpeed;}
                else if (that.options.anim==='indent') {speed = that.indentSpeed;}
                var startX = diathink.helper.offsetLeft;
                var startY = diathink.helper.offsetTop;
                var startWidth = diathink.helper.clientWidth;

                var destination = $(that.runtime.newPlaceholder[newView]).offset();
                if (that.runtime.oldPlaceholder[newView]) {
                    var oldOffset = $(that.runtime.oldPlaceholder[newView]).offset();
                    if (destination.top > oldOffset.top) {destination.top -= that.runtime.activeHeight[newView];}
                }
                $(diathink.helper).addClass('ui-first-child').addClass('ui-last-child');
                $.anim(function(frac) {
                    var left = String(Math.round(frac*destination.left+(1-frac)*startX));
                    var top = String(Math.round(frac*destination.top +(1-frac)*startY));
                    var css = {
                        left: left+'px',
                        top: top+'px'
                    };
                    if ((that.options.anim==='indent')&&(left > startX)) {
                        css.width = String(startWidth-(left-startX))+'px';
                    }
                    $(diathink.helper).css(css);
                }, speed, function() {
                    $(document.body).removeClass('transition-mode');
                    diathink.helper.parentNode.removeChild(diathink.helper);
                    // remove();
                    diathink.helper = null;
                    that.runtime.status.dockAnim = 2;
                    that.nextQueue();
                });
            });
        } else {
            this.runtime.status.dockAnim = 2;
        }

        // todo: assumptions and issue-handling
        this.execModel();
        var focusDeps = [];
        for (i in outlines) {
           this.execView(outlines[i]);
           focusDeps.push(['newPlaceAnim', outlines[i].rootID]);
           focusDeps.push(['view', outlines[i].rootID]);
        }
        this.addQueue('focus', focusDeps, function() {
            var o = that.options;
            if (o.focus) {
                if (o.undo) {
                    if (that.oldContext != null) {
                        $('#' + that.getView(o.activeID, o.oldView).header.name.text.id).focus();
                    }
                } else {
                    if (that.newContext != null) {
                        $('#' + that.getView(o.activeID, o.newView).header.name.text.id).focus();
                    }
                }
            }
        });

        // todo: increase undo-dependencies
        this.addQueue('undobuttons', ['newModelAdd'],
            function() {diathink.ActionManager.refreshButtons();});

        this.addQueue('end',['focus', 'undobuttons'], function() {
            var i, sub;
            that.validateNewContext();
            if (!that.options.undo && !that.options.redo) {
                for (i=that.subactions.length-1; i>=0; --i) {
                    sub = that.subactions[i];
                    sub.undo = false;
                    sub.redo = false;
                    sub.parentAction = that;
                    (function(o) {
                        diathink.ActionManager.subschedule(function() {
                            return o;
                        });
                    })(sub);
                }
            }
            var done = that.options.done;
            delete that.options['done'];
            done();
        });
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
        if (!options) {options = {};}
        options.undo = true;
        options.redo = false;
        this.undone = true;
        return this.exec(options);
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
        var activeModel = new diathink.OutlineNodeModel({text: this.options.text, children: null});
        this.options.activeID = activeModel.cid;
        return activeModel;
    },
    contextParentVisible: function(context, outline) {
        if (!context) {return null;}

        if (context.parent != null) {
            var parent = this.getView(context.parent, outline.rootID);
            if (parent != null) {
                if ($('#'+parent.id).hasClass('collapsed')) {
                    parent.children.collapsed = true;
                    return parent.children;
                } else {
                    parent.children.collapsed = false;
                    return parent.children;
                }
            } else { // parent is outside view, is it one level or more?
                if (this.getModel(context.parent).get('children') ===
                    M.ViewManager.getViewById(outline.rootID).value) {
                    return M.ViewManager.getViewById(outline.rootID);
                } else { // context is out of scope
                    return null;
                }
            }
        } else { // outline-root diathink.data
            if (M.ViewManager.getViewById(outline.rootID).value === diathink.data) {
                return M.ViewManager.getViewById(outline.rootID);
            } else {
                return null;
            }
        }
    },
    restoreContext: function() {
        var activeModel, collection, rank, oldCollection;
        var that = this;
        this.addQueue('oldModelCollection', ['modelCreate'], function() {
            activeModel = that.getModel(that.options.activeID);
            oldCollection = activeModel.parentCollection();
        });
        this.addQueue('oldModelRemove', ['oldModelCollection'], function() {
            if (oldCollection != null) { // if it's in a collection
                // if parent-collection is empty, reset collapse
                if ((!that.options.undo)&&(!that.options.redo)&&
                    (oldCollection.models.length===1)&&(that.type!=='CollapseAction')) {
                    var parent = activeModel.get('parent');
                    // don't do this with a collapse action.
                    if (parent) {
                        that.subactions.push({
                            action: diathink.CollapseAction,
                            activeID: parent.cid,
                            collapsed: false,
                            oldView: 'all',
                            newView: 'all',
                            focus: false
                        });
                    }
                }
                oldCollection.remove(activeModel);
            }
        });
        this.addQueue('newModelRank', ['oldModelRemove'], function() {
            var newContext;
            if (that.options.undo) {
                newContext = that.oldContext;
            } else {
                newContext = that.newContext;
            }
            if (newContext != null) { // if there was a prior location to revert to
                activeModel.deleted = false;
                if (newContext.parent != null) {
                    collection = that.getModel(newContext.parent).get('children');
                } else {
                    collection = diathink.data;
                }
                if (newContext.prev === null) {
                    rank = 0;
                } else {
                    rank = that.getModel(newContext.prev).rank()+1;
                }
            } else {
                activeModel.deleted = true;
            }
        });
        this.addQueue('newModelAdd', ['newModelRank'], function() {
            var newContext;
            if (that.options.undo) {
                newContext = that.oldContext;
            } else {
                newContext = that.newContext;
            }
            if (newContext != null) {
                collection.add(activeModel, {at: rank});
            } else {
                activeModel.set({parent: null});
            }
        });
    },
    preview:function (outline) {
        var that = this;
            // todo: for visible non-dragged sources, add fade-out on mousedown in nestedSortable.
        this.addQueue(['oldPlace', outline.rootID], ['preDock'], function() {
            if (that.options.excludeView && (that.options.excludeView === outline.rootID)) {
                return;
            }
            if (that.oldLocationExists) {
                var activeView = that.getView(that.options.activeID, outline.rootID);

                // if view doesn't exist, insert no placeholder because it's invisible
                if (activeView == null) {
                    // console.log("activeView is null in oldPlace for action type="+
                        // that.type+"; undo="+that.options.undo+"; redo="+
                        // that.options.redo+"; activeID="+that.options.activeID+
                        // "; rootID="+outline.rootID);
                    return;
                }
                // vanish if not already hidden & shrink over 80ms
                if ($('#'+activeView.id).length===0) {
                    console.log('ERROR: activeView '+activeView.id+' exists but has not element for oldPlace');
                    debugger;
                }
                var activeObj = $('#'+activeView.id).addClass('drag-hidden');
                var activeHeight = activeObj[0].clientHeight;
                var oldPlaceholder = $('<div></div>').addClass('li-placeholder').css('height',activeHeight);
                if (activeObj.hasClass('ui-first-child')) {
                    oldPlaceholder.addClass('ui-first-child');
                }
                if (activeObj.hasClass('ui-last-child')) {
                    oldPlaceholder.addClass('ui-last-child');
                }
                // if placeholder is present, old activeView-element must be removed.
                activeObj[0].parentNode.replaceChild(oldPlaceholder[0],activeObj[0]);
                // activeObj is here removed from DOM, though still has a view.
                that.runtime.activeHeight[outline.rootID] = activeHeight;
                that.runtime.oldPlaceholder[outline.rootID] = oldPlaceholder[0];
                that.runtime.activeElem[outline.rootID] = activeObj[0];
            }
        });
        this.addAsync(['oldPlaceAnim', outline.rootID], [['oldPlace', outline.rootID]], function() {
            if (that.runtime.oldPlaceholder[outline.rootID] && (that.options.anim !== 'indent')) {
                var speed;
                if (that.options.anim==='delete') {speed = that.deleteSpeed;}
                else if (that.options.anim==='create') {speed = that.createSpeed;}
                else {speed = that.placeholderSpeed;}
                var startHeight = that.runtime.oldPlaceholder[outline.rootID].clientHeight;
                $.anim(function(frac) {
                    $(that.runtime.oldPlaceholder[outline.rootID]).css('height',String(Math.round(startHeight*(1-frac)))+'px');
                }, speed, function() {
                    // console.log("Updating status after finishing async sourceAnim:"+outline.rootID);
                    that.runtime.status.oldPlaceAnim[outline.rootID] = 2;
                    that.nextQueue();
                });
            } else {
                that.runtime.status.oldPlaceAnim[outline.rootID] = 2;
                that.nextQueue();
            }
        });
        this.addQueue(['newPlace', outline.rootID], ['context', ['oldPlace', outline.rootID]], function() {
            var newContext;
            if (that.options.excludeView && (that.options.excludeView === outline.rootID)) {
                return;
            }
            if (that.options.undo) {
                newContext = that.oldContext;
            } else {
                newContext = that.newContext;
            }
            var parentView = that.contextParentVisible(newContext, outline);
            if (parentView) {
                if (! parentView.collapsed) { // don't add a placeholder if parent is collapsed
                    var place = $('<div></div>').addClass('li-placeholder');
                    that.runtime.newPlaceholder[outline.rootID] = place.get(0);
                    if (! newContext.prev) {
                        place.addClass('ui-first-child');
                    }
                    if (! newContext.next) {
                        place.addClass('ui-last-child');
                    }
                    if (newContext.next) {
                        place.insertBefore('#'+that.getView(newContext.next, outline.rootID).id);
                    } else if (newContext.prev) {
                        place.insertAfter('#'+that.getView(newContext.prev, outline.rootID).id);
                    } else if (newContext.parent) {
                        place.appendTo('#'+parentView.id);
                    }
                }
            }
        });

        this.addAsync(['newPlaceAnim', outline.rootID], [['newPlace', outline.rootID]], function() {
            if (that.runtime.newPlaceholder[outline.rootID] && (that.options.anim !== 'indent')) {
                var endHeight = that.runtime.activeHeight[outline.rootID];
                if (!endHeight) {
                    endHeight = Math.round(1.5*Number($(document.body).css('font-size').replace(/px/,'')));
                }
                var speed;
                if (that.options.anim==='delete') {speed = that.deleteSpeed;}
                else if (that.options.anim==='create') {speed = that.createSpeed;}
                else {speed = that.placeholderSpeed;}
                $.anim(function(frac) {
                    $(that.runtime.newPlaceholder[outline.rootID]).css('height', String(Math.round(frac*endHeight))+'px');
                }, speed, function() {
                    that.runtime.status.newPlaceAnim[outline.rootID] = 2;
                    that.nextQueue();
                });
            } else {
                that.runtime.status.newPlaceAnim[outline.rootID] = 2;
                that.nextQueue();
            }
        });
    },
    restoreViewContext: function(outline) {
        var that = this;
        var deps = ['newModelAdd', ['oldPlaceAnim', outline.rootID], ['newPlaceAnim', outline.rootID]];
        if ((that.options.anim==='dock')||(that.options.anim==='indent')) {
            deps.push('dockAnim');
        }
        this.addQueue(['view', outline.rootID], deps, function() {
            var collection, rank, oldParent, oldParentView=null;
            var newContext, li, elem, oldspot, neighbor, neighborType, newParentView, createActiveView=false;

            if (that.options.undo) {
                newContext = that.oldContext;
            } else {
                newContext = that.newContext;
            }
            // todo: this is a mess, with placeholders and undo.  Need to simplify.
            var activeView = that.getView(that.options.activeID, outline.rootID);
            // activeView should not be affected by oldPlaceholder, except for DOM presence
            if (activeView!=null) { // original element was visible in this view
                oldspot = that._saveOldSpot(activeView);
                if (!oldspot) {
                    console.log("ERROR: Oldspot does not exist for action "+that.type+
                        "; undo="+that.options.undo+"; redo="+that.options.redo+
                        "; activeID="+that.options.activeID+"; view="+outline.rootID);
                    debugger;
                }
                neighbor = oldspot.obj;
                neighborType = oldspot.type;
            } else { // if old-view isn't visible, check if parent needs collapse-update
                // todo: can oldParent be replaced with a newContext-newParentView instead?
                if (that.options.undo) {
                    if (that.newContext) {
                        oldParent = that.getModel(that.newContext.parent);
                    }
                } else if (that.oldContext) {
                    oldParent = that.getModel(that.oldContext.parent);
                }
                if (oldParent && oldParent.views && oldParent.views[outline.rootID]) {
                    oldParentView = oldParent.views[outline.rootID];
                }
            }
            // oldParentView != null means it needs to be checked if it changed to a leaf

            // get parent listview; unless newContext is not in this view, then null
            newParentView = that.contextParentVisible(newContext, outline);
            if (newParentView && newParentView.collapsed) {
                // adding child to collapsed parent
                $('#'+newParentView.parentView.id).addClass('branch').removeClass('leaf');
                newParentView = null;
            }

            if (!newParentView) {newParentView=null; newContext = null;}

            if (newContext === null) {
                if (activeView != null) {activeView.destroy(that.runtime.activeElem[outline.rootID]);}
                  // destroy() also detaches view-reference from model
            } else {
                if (activeView == null) { // create
                    activeView = that.newListItemView(newParentView);
                    // todo: add text in?
                    activeView.value.setView(activeView.rootID, activeView);
                    elem = $(activeView.render());
                    // enable recursive creation when moving out of collapsed view
                    if (! activeView.value.get('collapsed')) {
                        // console.log('Calling renderUpdate from execView');
                        activeView.children.renderUpdate(elem.find('#'+activeView.children.id)[0]);
                    }
                    createActiveView = true;
                } else { // move
                    if (that.runtime.activeElem[outline.rootID] && that.runtime.activeElem[outline.rootID].id === activeView.id) {
                        elem = $(that.runtime.activeElem[outline.rootID]);
                        that.runtime.activeElem[outline.rootID] = undefined;
                    } else {
                        elem = $('#'+activeView.id).detach();
                    }
                    // restore height if it was lost
                    elem.css('height','').removeClass('drag-hidden');
                    activeView.parentView = newParentView;
                }

                // put elem into newContext
                // this cleans up destination-placeaholder; what about source-placeholder?
                //   it could vanish automatically?
                if (that.runtime.newPlaceholder[outline.rootID]) {
                    that.runtime.newPlaceholder[outline.rootID].parentNode.
                        replaceChild(elem[0], that.runtime.newPlaceholder[outline.rootID]);
                } else {
                    if (newContext.prev == null) {
                        var parentElem = $('#'+newParentView.id);
                        parentElem.prepend(elem);
                    } else {
                        var prevElem = $('#'+that.getView(newContext.prev, outline.rootID).id);
                        prevElem.after(elem);
                    }
                }

                if (createActiveView) { // todo: add classes in detached-mode instead of here?
                    activeView.theme(); // add classes and if there is content, fixHeight
                    if (activeView.value.get('collapsed')) {
                        $('#'+activeView.id).addClass('collapsed').addClass('branch').removeClass('leaf');
                    } else {
                        if (activeView.value.get('children').length>0) {
                            $('#'+activeView.id).addClass('expanded').addClass('branch').removeClass('leaf');
                        } else {
                            $('#'+activeView.id).addClass('expanded').addClass('leaf').removeClass('branch');
                        }
                    }
                }

                // fix activeView's top/bottom corners
                activeView.themeFirst(); // could check if this two are strictly necessary
                activeView.themeLast();

                // fixup new neighborhood
                if (newContext.next && (newContext.prev == null)) {
                    $('#'+activeView.id).next().removeClass('ui-first-child');
                }
                if (newContext.prev && (newContext.next == null)) {
                    $('#'+activeView.id).prev().removeClass('ui-last-child');
                }
                if ((newContext.prev==null)&&(newContext.next==null)) {
                    // todo: could parentView be outline-root?
                    // adding child to expanded parent
                    var elem = $('#'+activeView.parentView.parentView.id);
                    elem.addClass('branch').removeClass('leaf');
                }
            }
            // remove source-placeholder
            if (that.runtime.oldPlaceholder[outline.rootID]) {
                that.runtime.oldPlaceholder[outline.rootID].parentNode.removeChild(that.runtime.oldPlaceholder[outline.rootID]);
                that.runtime.oldPlaceholder[outline.rootID] = undefined;
                that.runtime.activeElem[outline.rootID] = undefined;
                that.runtime.activeHeight[outline.rootID] = undefined;
            }

            if (neighbor) { // fixup old location (expanded)
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
                    // removing last child from expanded parent
                    var elem = $('#'+neighbor.id);
                    elem.addClass('leaf').removeClass('branch').
                        addClass('expanded').removeClass('collapsed');
                } else if (neighborType==='root') {
                    // todo: add a placeholder for empty panel
                }
            } else if (oldParentView) { // (collapsed)
                if (oldParent.get('children').models.length===0) {
                    // removing last child from collapsed parent
                    $('#'+oldParentView.id).removeClass('branch').addClass('leaf');
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
        if (this.options.activeID) {
            li.modelId = this.options.activeID;
            var item = diathink.OutlineNodeModel.getById(this.options.activeID);
        } else {
            // if view is rendered without a model
            // {text: this.options.lineText}; // from list
        }
        // todo: listview() classes should be on li before it is cloned
        li = parentView.cloneObject(li, item);
        li.value = item; // enables getting the value/contentBinding of a list item in a template view.
        li.parentView = parentView;
        li.setRootID(parentView.rootID);
        li.children.value = li.value.attributes.children;

        return li;
    },

    _saveOldSpot: function(view) {
        var type = 'next';
        var elem;
        if (this.runtime.activeElem[view.rootID] && (this.runtime.activeElem[view.rootID].id === view.id)) {
            elem = $(this.runtime.oldPlaceholder[view.rootID]);
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
                return {type: 'root', obj: M.ViewManager.getViewById(view.rootID)}
                // console.log("_saveOldSpot returning null for view "+view.id);
                // return null;
            }
        }
    },
    getOldContext: function() {
        if (! this.options.activeID) {
            this.oldContext = null;
        } else {
            this.oldContext = this.getContextAt(this.options.activeID);
        }
    },
    execModel: function () {
        var that = this, newContext;
        if (this.undo) {
            newContext = this.oldContext;
        } else {
            newContext = this.newContext;
        }
        this.addQueue('modelCreate', ['context'], function() {
            if (!that.options.activeID) {
                var activeModel = new diathink.OutlineNodeModel({text: that.options.text, children: null});
                that.options.activeID = activeModel.cid;
            }
        });
        this.restoreContext();
    },
    execView:function (outline) {
        var that = this;
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
        action.exec(options);
        return action;
    },
    checkTextChange:function(id) {
        // console.log("Checking text change for id="+id);
        var value = $('#'+id).val();
        console.log('checkTextChange: id = '+id);
        if (!M.ViewManager.getViewById(id)) {
            return false; // view was deleted since being edited
        }
        var view = M.ViewManager.getViewById(id).parentView.parentView.parentView;
        var model = view.value;
        if (model.get('text') !== value) {
            //console.log("TextAction for id="+id+"; model="+
              //  model.cid+" with value="+$('#'+id).val());
                return {
                    action: diathink.TextAction,
                    activeID: model.cid,
                    text: value,
                    oldView: view.rootID,
                    newView: view.rootID,
                    focus: false
                }
        }
        return false;
    }
});

// commuting operations don't have to be undone/redone - optimization

diathink.InsertAfterAction = diathink.Action.extend({
    type:"InsertAfterAction",
    options: {activeID: null, referenceID: null, text: ""},
    _validateOptions: {
        requireActive: false,
        requireReference: true,
        requireOld: false,
        requireNew: true
    },
    getNewContext: function() {
        this.newContext = this.getContextAfter(this.options.referenceID);
    }
});

diathink.MoveAfterAction = diathink.Action.extend({
    type:"MoveAfterAction",
    _validateOptions: {
        requireActive: true,
        requireReference: true,
        requireOld: true,
        requireNew: true
    },
    options: {activeID: null, referenceID: null, transition: false},
    getNewContext: function() {
        this.newContext = this.getContextAfter(this.options.referenceID);
    }
});

diathink.MoveBeforeAction = diathink.Action.extend({
    type:"MoveBeforeAction",
    _validateOptions: {
        requireActive: true,
        requireReference: true,
        requireOld: true,
        requireNew: true
    },
    options: {activeID: null, referenceID: null, transition: false},
    getNewContext: function() {
        this.newContext = this.getContextBefore(this.options.referenceID);
    }
});

diathink.MoveIntoAction = diathink.Action.extend({
    type:"MoveIntoAction",
    _validateOptions: {
        requireActive: true,
        requireReference: true,
        requireOld: true,
        requireNew: false,
        requireNewReference: true
    },
    options: {activeID: null, referenceID: null, transition: false},
    getNewContext: function() {
        this.newContext = this.getContextIn(this.options.referenceID);
    }
});

// todo: merge outdent with moveafter action?
diathink.OutdentAction = diathink.Action.extend({
    type:"OutdentAction",
    _validateOptions: {
        requireActive: true,
        requireReference: true,
        requireOld: true,
        requireNew: true
    },
    options: {activeID: null, referenceID: null, transition: false},
    getNewContext: function() {
        this.newContext = this.getContextAfter(this.options.referenceID);
    }
});

diathink.ActionCollection = Backbone.Collection.extend({
    model: diathink.Action
});

diathink.DeleteAction = diathink.Action.extend({
    type:"DeleteAction",
    _validateOptions: {
        requireActive: true,
        requireReference: false,
        requireOld: true,
        requireNew: false
    },
    options: {activeID: null, transition: false},
    getNewContext: function() {
        this.newContext = null;
    }
});

diathink.TextAction= diathink.Action.extend({
    type:"TextAction",
    options: {activeID: null, text: null, transition: false},
    _validateOptions: {
        requireActive: true,
        requireReference: false,
        requireOld: true,
        requireNew: true
    },
    getNewContext: function() {
        this.newContext = this.oldContext;
    },
    preview: function() {},
    execModel: function () {
        var that = this;
        that.addQueue('newModelAdd', ['context'], function() {
            var text;
            if (that.options.undo) {
                text = that.oldText;
            } else {
                text = that.options.text;
            }
            var activeModel = that.getModel(that.options.activeID);
            if ((!that.options.undo) && (!that.options.redo)) {
                that.oldText = activeModel.get('text');
            }
            activeModel.set('text', text);
        });
    },
    execView:function (outline) {
        var that = this;
        this.addQueue(['view', outline.rootID], ['newModelAdd'], function() {
            var text;
            if (that.options.undo) {
                text = that.oldText;
            } else {
                text = that.options.text;
            }
            var activeView = that.getView(that.options.activeID, outline.rootID);
            if (activeView != null) {
                activeView.header.name.text.value = text;
                // console.log("Updating view "+activeView.header.name.text.id+" to value "+this.options.text);
                $('#'+activeView.header.name.text.id).val(text);
                activeView.header.name.text.themeUpdate();
            }
            // satisfy additional dependencies that are never used in this actiontype
            that.runtime.status.newPlaceAnim[outline.rootID] = 2;
        });
    }
});


diathink.CollapseAction= diathink.Action.extend({
    type:"CollapseAction",
    options: {activeID: null, collapsed: false},
    _validateOptions: {
        requireActive: true,
        requireReference: false,
        requireOld: true,
        requireNew: true
    },
    getNewContext: function() {
        this.newContext = this.oldContext;
    },
    preview: function() {},
    execModel: function () {
        var that = this;
        that.addQueue('newModelAdd', ['context'], function() {
            var collapsed;
            if (that.options.undo) {
                collapsed = that.oldCollapsed;
            } else {
                collapsed = that.options.collapsed;
            }
            var activeModel= that.getModel(that.options.activeID);
            if ((!that.options.undo) && (!that.options.redo)) {
                that.oldCollapsed = activeModel.get('collapsed');
                if (!that.oldCollapsed) {that.oldCollapsed = false;}
            }
            // console.log("Setting model "+that.options.activeID+" collapsed = "+collapsed);
            activeModel.set('collapsed', collapsed);
        });
    },
    execView:function (outline) {
        var that = this;
        this.addQueue(['view', outline.rootID], ['newModelAdd'], function() {
            if (((that.options.oldView === outline.rootID)||
                    (that.options.oldView==='all')) ||
                ((that.options.undo || that.options.redo)&&
                    that.oldViewCollapsed[outline.rootID]!==undefined) ) {
                var collapsed;
                if (that.options.undo) {
                    // oldCollapsed depends on view.
                    collapsed = that.oldViewCollapsed[outline.rootID];
                    // console.log("Undo retrieved collapsed = "+collapsed+" for view="+outline.rootID);
                } else {
                    collapsed = that.options.collapsed;
                }
                var activeView = that.getView(that.options.activeID, outline.rootID);
                if (!activeView) {
                    console.log("Action collapse="+collapsed+" has no activeView, with activeID="+
                        that.options.activeID+"; oldView="+outline.rootID+
                        "; undo="+that.options.undo);
                    // Action collapse=false has no activeView, with activeID=c14; oldView=m_16; undo=false
                    that.runtime.status.newPlaceAnim[outline.rootID] = 2;
                    return;
                }
                if (!that.options.undo && !that.options.redo) {
                    that.oldViewCollapsed[outline.rootID] = $('#'+activeView.id).hasClass('collapsed');
                    // console.log("Set oldViewCollapsed for "+outline.rootID+" to "+that.oldViewCollapsed[outline.rootID]);
                }
                if (collapsed) {
                    $('#'+activeView.id).removeClass('expanded').addClass('collapsed');
                    activeView.children.removeAllItems();
                } else {
                    $('#'+activeView.id).addClass('expanded').removeClass('collapsed');
                    activeView.children.renderUpdate();
                }
            }
            // satisfy additional dependencies that are never used in this actiontype
            that.runtime.status.newPlaceAnim[outline.rootID] = 2;
        });
    }
});


diathink.RootAction= diathink.Action.extend({
    type:"RootAction",
    options: {activeID: null, collapsed: false},
    _validateOptions: {
        requireActive: false,
        requireReference: false,
        requireOld: false,
        requireNew: false
    },
    getNewContext: function() {
        this.newContext = this.oldContext;
    },
    preview: function() {},
    execModel: function () {
        var that = this;
        that.addQueue('newModelAdd', ['context'], function() {
            if ((!that.options.undo) && (!that.options.redo)) {
                var c = diathink.ActionManager;
                if (c.actions.at(c.lastAction) !== that) {
                    console.log('ERROR: lastAction is not this');
                    debugger;
                }
                var prevAction = c.actions.at(c.lastAction-1);
                if ((prevAction.type==='CollapseAction')&&
                    (prevAction.options.activeID === that.options.activeID)) {
                    var activeModel= that.getModel(that.options.activeID);
                    activeModel.set('collapsed', !activeModel.get('collapsed'));
                    prevAction.undone = true;
                    prevAction.lost = true;
                    // update undo-buttons?
                }
            }
            // todo: save current perspective into model?
        });
    },
    execView:function (outline) {
        var that = this;
        this.addQueue(['view', outline.rootID], ['newModelAdd'], function() {
            var model=null;
            if (outline.rootID === that.options.oldView) {
                if (that.options.undo) {
                    model = that.oldRootModel;
                } else {
                    if (!that.options.redo) {
                        that.oldRootModel = M.ViewManager.getViewById(that.options.oldView).rootModel;
                    }
                    if (that.options.activeID) {
                        model = that.getModel(that.options.activeID);
                    }
                }
                M.ViewManager.getViewById(that.options.oldView).parentView
                    .parentView.changeRoot(model);
            }
            that.runtime.status.newPlaceAnim[outline.rootID] = 2;
        });
    }
});

