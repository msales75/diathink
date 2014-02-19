
// todo: get the information we need early on from action,
//  to know what the oldType, newType and contexts are.

// types: line, panel, link, breadcrumb, inlink
// for each type, must have location, box-dims, text-size,


// todo: Put text and collapsed into oldModelContext/newModelContext
// todo: Put old-focus & view-collapsed into ?
// todo: Put panel into new/oldPanelContext

// Flag for scroll
// todo: action stores oldFocus and newFocus ? (maybe not)
// todo: handle focusID in context, and validate it.
// todo: undo-scroll (maybe focus)
m_require("app/controllers/actionBase.js");
m_require("app/controllers/actionAnimZ.js");

$D.OutlineAction = $D.Action.extend({

    init: function() {
        $D.Action.prototype.init.call(this, arguments);
        _.extend(this, {
            oldType: 'line',
            newType: 'line',
            oldModelContext:null,
            newModelContext:null,
            oldPanelContext:null,
            newPanelContext:null,
            oldViewCollapsed: {},
            useOldLinePlaceholder: true,
            useNewLinePlaceholder: true
        });
    },
    runinit: function() {
        $D.Action.prototype.runinit.call(this, arguments);
        _.extend(this.runtime, {
            activeLineElem: {},
            activeLineHeight: {},
            rOldContextType: {},
            rNewContextType: {},
            rNewLinePlaceholder: {},
            rOldLinePlaceholder: {},
            rOldLineVisible: {},
            rNewLineVisible: {},
            oldLineContext: {},
            createLineElem: {},
            destroyLineElem: {},
            useLinePlaceholderAnim: {},
            status: {
                context: 0,
                log: 0,
                undobuttons: 0,
                oldModelCollection: 0,
                oldModelRemove: 0,
                modelCreate: 0,
                newModelRank: 0,
                newModelAdd: 0,
                focus: 0,
                end: 0,
                view: {},
             // todo: should separate these into animatino-file:?
                createDockElem: 0,
                dockAnim: 0,
                panelPrep: 0,
                anim: 0,
                oldLinePlace: {},
                newLinePlace: {},
                linePlaceAnim: {}
            }
        });
        var o = this.options, r = this.runtime;
        if (o.undo) {
            r.rNewRoot = o.oldRoot;
            r.rOldRoot = o.newRoot;
        } else {
            r.rNewRoot = o.newRoot;
            r.rOldRoot = o.oldRoot;
        }
        console.log("Setting performDock based on anim = "+ o.anim);
        if ((o.anim==='dock')||(o.anim==='indent')||(o.anim==='paneldock')) {
            r.performDock = true;
            if (o.dockElem) {
                r.createDockElem = false;
            } else {
                r.createDockElem = true;
            }
        } else {
            r.performDock = false;
            r.createDockElem = false;
        }
    },
    runinit2: function() {
        var o = this.options, r = this.runtime;
        if (o.undo) {
            r.rOldModelContext = this.newModelContext;
            r.rNewModelContext = this.oldModelContext;
        } else {
            r.rOldModelContext = this.oldModelContext;
            r.rNewModelContext = this.newModelContext;
        }

        r.createModel = false;
        r.destroyModel = false;
        if (r.rOldModelContext && !r.rNewModelContext) {
            r.createModel = true;
        } else if (r.rNewModelContext && !r.rOldModelContext) {
            r.destroyModel = true;
        }


        var outlines = $D.OutlineManager.outlines;
        for (var i in outlines) {
            // figure out what kind of object activeID is in each outline.
            r.rOldContextType[i] = this.getContextType(r.rOldModelContext, outlines[i]);
            r.rNewContextType[i] = this.getContextType(r.rNewModelContext, outlines[i]);

            if (r.rOldType==='line') {
                if (this.options.activeID) {
                    var lineView = this.getLineView(this.options.activeID, i);
                    if (lineView) { // lineView can be null when creating new element
                        r.oldLineContext[i] = this.getLineContext(lineView);
                    }
                }
                if ((r.rOldContextType[i]==='none')||
                    (r.rOldContextType[i]==='parentInvisible')||
                    (r.rOldContextType[i]==='parentIsCollapsedLine')) {
                    r.rOldLineVisible[i] = false;
                } else if ((r.rOldContextType[i]==='parentIsRoot')||
                    (r.rOldContextType[i]==='parentIsExpandedLine')) {
                    r.rOldLineVisible[i] = true;
                } else {
                    console.log('ERROR');
                    debugger;
                }
            }
            if (r.rNewType==='line') {
                if ((r.rNewContextType[i]==='none')||
                    (r.rNewContextType[i]==='parentInvisible')||
                    (r.rNewContextType[i]==='parentIsCollapsedLine')) {
                    r.rNewLineVisible[i] = false;
                } else if ((r.rNewContextType[i]==='parentIsRoot')||
                    (r.rNewContextType[i]==='parentIsExpandedLine')) {
                    r.rNewLineVisible[i] = true;
                } else {
                    console.log('ERROR');
                    debugger;
                }
            }

            r.rOldLinePlaceholder[i] = false;
            r.rNewLinePlaceholder[i] = false;
            if ((r.rNewType==='line')&&(r.rOldType==='line')) {
                if (r.rOldLineVisible[i] && this.useOldLinePlaceholder) {r.rOldLinePlaceholder[i] = true;}
                if (r.rNewLineVisible[i] && this.useNewLinePlaceholder) {r.rNewLinePlaceholder[i] = true;}
            }
            r.useLinePlaceholderAnim[i] = false;
            if ((r.rOldLinePlaceholder[i] || r.rNewLinePlaceholder[i])) {
                if (this.options.anim !== 'indent') {
                    r.useLinePlaceholderAnim[i] = true;
                }
            }

            r.createLineElem[i] = false;
            r.destroyLineElem[i] = false;
            if ((r.rNewType==='line') && r.rNewLineVisible[i] && !r.rOldLineVisible[i]) {
                r.createLineElem[i] = true;
            } else if ((r.rOldType==='line') && r.rOldLineVisible[i] && !r.rNewLineVisible[i]) {
                r.destroyLineElem[i] = true;
            }
            // r.rNewLinePlaceholder[i] = {};
            // r.activeLineElem[i]
            // r.activeLineHeight[i]
            // rOldModelContext, rNewModelContext
            // panelContext,
            // r.rOldPanelPlaceholder;
            // r.rNewPanelPlaceholder;
            // r.activePanelElem
        }
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
        if (!o.oldRoot || !o.newRoot) {
            console.log("ERROR: Action "+this.type+" missing oldRoot or newRoot");
            debugger;
        }
        if (o.oldRoot !== 'all') {
            if (!$D.OutlineManager.outlines[o.oldRoot] && !$D.OutlineManager.deleted[o.oldRoot]) {
                console.log('ERROR: Action '+this.type+' has invalid oldRoot');
                debugger;
            }
        }
        if ((o.newRoot !== 'all')&&(o.newRoot!=='new'))  {
            if (!$D.OutlineManager.outlines[o.newRoot] && !$D.OutlineManager.deleted[o.newRoot]) {
                console.log('ERROR: Action '+this.type+' has invalid newRoot');
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
                if (o.oldRoot !== 'all') {
                    if (!activeModel.views || !activeModel.views[o.oldRoot]) {
                        console.log('ERROR: No old-view found for activeID='+ o.activeID);
                        debugger;
                    }
                }
            }
            if (v.requireNew && o.undo) {
                if (o.newRoot !== 'all') {
                    if (!activeModel.views || !activeModel.views[o.newRoot]) {
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
            // reference is only used in newRoot, not oldRoot
            if (v.requireNew || v.requireNewReference) {
                if (!refModel.views || !refModel.views[o.newRoot]) {
                    console.log('ERROR: No new-view found for referenceID='+ o.referenceID);
                    debugger;
                }
            }
            if (v.requireNewReference && o.undo) {
                if (o.newRoot !== 'all') {
                    if (!activeModel.views || !activeModel.views[o.newRoot]) {
                        if (! $('#'+refModel.views[o.newRoot].id).hasClass('collapsed')) {
                            console.log('ERROR: Missing newRoot for activeID='+ o.activeID);
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
            if ((this.newModelContext == null)||(this.oldModelContext == null)) {
                console.log("ERROR: Anim="+ o.anim+" but old or new context is null");
                debugger;
            }
        }
        if (o.undo) {
            context = this.newModelContext;
            if (this.type==='DeleteAction') {
                if (context !== null) {
                    console.log("ERROR: DeleteAction undo with newModelContext-not-null");
                    debugger;
                }
                return;
            }
        } else {
            context = this.oldModelContext;
            if (this.type==='InsertAfterAction') {
                if (context !== null) {
                    console.log("ERROR: Insert action with oldModelContext not-null");
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
            context = this.oldModelContext;
            if (this.type==='InsertAfterAction') {
                if (context !== null) {
                    console.log("ERROR: Insert action with oldModelContext not-null");
                    debugger;
                }
                return;
            }
        } else {
            context = this.newModelContext;
            if (this.type==='DeleteAction') {
                if (context !== null) {
                    console.log("ERROR: DeleteAction undo with newModelContext-not-null");
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
        // todo: validate ViewContext, too.
        // todo: put text, collapsed, focus into oldModelContext and newModelContext.
        // (and oldRoot and newRoot?)
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
    contextStep: function() {
        this.getOldContext();
        this.getNewContext();
    },
    getModel: function(id) {
        return Backbone.Relational.store.find($D.OutlineNodeModel, id);
    },
    getLineView: function(id, rootid) {
        var model = this.getModel(id);
        if (model.views == null) {return null;}
        return model.views[rootid];
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
        var reference = $D.OutlineNodeModel.getById(id);
        var collection = reference.get('children');
        var context = {parent: id, next: null};
        if (collection.length===0) {
            context.prev = null;
        } else {
            context.prev = collection.at(collection.length-1).cid;
        }
        return context;
    },
    focus: function() {
        // by default, focus on activeID in newRoot
        var newRoot;
        if (this.options.undo) {
            newRoot = this.options.oldRoot;
        } else {
            newRoot = this.options.newRoot;
        }
        var lineView = this.getLineView(this.options.activeID, newRoot);
        if (!lineView) { return; }
        var id = lineView.header.name.text.id;
        $('#'+id).focus();
    },
    newModel: function() {
        var activeModel = new $D.OutlineNodeModel({text: this.options.text, children: null});
        this.options.activeID = activeModel.cid;
        return activeModel;
    },
    getContextType: function(context, outline) {
        if (!context) {return 'none';}

        if (context.parent != null) {
            var parent = this.getLineView(context.parent, outline.rootID);
            if (parent != null) {
                if ($('#'+parent.id).hasClass('collapsed')) {
                    return 'parentIsCollapsedLine';
                } else {
                    return 'parentIsExpandedLine';
                }
            } else { // parent is outside view, is it one level or more?
                if (this.getModel(context.parent).get('children') ===
                    M.ViewManager.getViewById(outline.rootID).value) {
                    return 'parentIsRoot';
                } else { // context is out of scope
                    return 'parentInvisible';
                    // might be under collapsed item or outside it
                }
            }
        } else { // outline-root $D.data
            if (M.ViewManager.getViewById(outline.rootID).value === $D.data) {
                return 'parentIsRoot';
            } else {
                return 'parentInvisible';
                // context is outside of outline
                console.log('called getContext with no parent but not at root');
                debugger;
                return null;
            }
        }
    },
    contextParentVisible: function(context, outline) {
        if (!context) {return null;}

        if (context.parent != null) {
            var parent = this.getLineView(context.parent, outline.rootID);
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
        } else { // outline-root $D.data
            if (M.ViewManager.getViewById(outline.rootID).value === $D.data) {
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
                            action: $D.CollapseAction,
                            activeID: parent.cid,
                            collapsed: false,
                            oldRoot: 'all',
                            newRoot: 'all',
                            focus: false
                        });
                    }
                }
                oldCollection.remove(activeModel);
            }
        });
        this.addQueue('newModelRank', ['oldModelRemove'], function() {
            var newModelContext;
            if (that.options.undo) {
                newModelContext = that.oldModelContext;
            } else {
                newModelContext = that.newModelContext;
            }
            if (newModelContext != null) { // if there was a prior location to revert to
                activeModel.deleted = false;
                if (newModelContext.parent != null) {
                    collection = that.getModel(newModelContext.parent).get('children');
                } else {
                    collection = $D.data;
                }
                if (newModelContext.prev === null) {
                    rank = 0;
                } else {
                    rank = that.getModel(newModelContext.prev).rank()+1;
                }
            } else {
                activeModel.deleted = true;
            }
        });
        this.addQueue('newModelAdd', ['newModelRank'], function() {
            var newModelContext;
            if (that.options.undo) {
                newModelContext = that.oldModelContext;
            } else {
                newModelContext = that.newModelContext;
            }
            if (newModelContext != null) {
                collection.add(activeModel, {at: rank});
            } else {
                activeModel.set({parent: null});
            }
        });
    },

    restoreViewContext: function(outline) {
        var that = this;
        this.addQueue(['view', outline.rootID], ['newModelAdd', 'anim'], function() {
            var r= that.runtime;
            var collection, rank, oldParent, oldParentView=null;
            var newModelContext, li, elem, oldspot, neighbor, neighborType, newParentView, createActiveLineView=false;

            newModelContext = r.rNewModelContext;
            // todo: this is a mess, with placeholders and undo.  Need to simplify.
            var activeLineView = that.getLineView(that.options.activeID, outline.rootID);
            // activeLineView should not be affected by rOldLinePlaceholder, except for DOM presence
            if (activeLineView!=null) { // original element was visible in this view
                if (!r.oldLineContext[outline.rootID]) {
                    console.log("ERROR: Oldspot does not exist for action "+that.type+
                        "; undo="+that.options.undo+"; redo="+that.options.redo+
                        "; activeID="+that.options.activeID+"; view="+outline.rootID);
                    debugger;
                }
                // should get this earlier, per view, like rNewLineContext
                neighbor = r.oldLineContext[outline.rootID].obj;
                neighborType = r.oldLineContext[outline.rootID].type;
            } else { // if old-view isn't visible, check if parent needs collapse-update
                // todo: can oldParent be replaced with a newModelContext-newParentView instead?
                if (that.options.undo) {
                    if (that.newModelContext) {
                        oldParent = that.getModel(that.newModelContext.parent);
                    }
                } else if (that.oldModelContext) {
                    oldParent = that.getModel(that.oldModelContext.parent);
                }
                if (oldParent && oldParent.views && oldParent.views[outline.rootID]) {
                    oldParentView = oldParent.views[outline.rootID];
                }
            }
            // oldParentView != null means it needs to be checked if it changed to a leaf

            // get parent listview; unless newModelContext is not in this view, then null
            newParentView = that.contextParentVisible(newModelContext, outline);
            if (newParentView && newParentView.collapsed) {
                // adding child to collapsed parent
                $('#'+newParentView.parentView.id).addClass('branch').removeClass('leaf');
                console.log('Nulling newModelContext because parent isnt visible');
                newParentView = null;
            }

            if (!newParentView) {newParentView=null; newModelContext = null;}


            if (newModelContext === null) {
                console.log('Have newModelContext = null for outline='+outline.rootID);
                if (activeLineView != null) {activeLineView.destroy(r.activeLineElem[outline.rootID]);}
                // destroy() also detaches view-reference from model
            } else {
                if (activeLineView == null) { // create
                    activeLineView = that.newListItemView(newParentView);
                    // todo: add text in?
                    activeLineView.value.setView(activeLineView.rootID, activeLineView);
                    elem = $(activeLineView.render());
                    // enable recursive creation when moving out of collapsed view
                    if (! activeLineView.value.get('collapsed')) {
                        // console.log('Calling renderUpdate from execView');
                        activeLineView.children.renderUpdate(elem.find('#'+activeLineView.children.id)[0]);
                    }
                    createActiveLineView = true;
                } else { // move
                    if (r.activeLineElem[outline.rootID] && r.activeLineElem[outline.rootID].id === activeLineView.id) {
                        elem = $(r.activeLineElem[outline.rootID]);
                        r.activeLineElem[outline.rootID] = undefined;
                    } else {
                        elem = $('#'+activeLineView.id).detach();
                    }
                    // restore height if it was lost
                    elem.css('height','').removeClass('drag-hidden');
                    activeLineView.parentView = newParentView;
                }

                // put elem into newModelContext
                // this cleans up destination-placeaholder; what about source-placeholder?
                //   it could vanish automatically?
                if (r.rNewLinePlaceholder[outline.rootID]) {
                    console.log('Replacing newlinePlaceholder for '+outline.rootID);
                    r.rNewLinePlaceholder[outline.rootID].parentNode.
                        replaceChild(elem[0], r.rNewLinePlaceholder[outline.rootID]);
                } else {
                    if (newModelContext.prev == null) {
                        var parentElem = $('#'+newParentView.id);
                        parentElem.prepend(elem);
                    } else {
                        var prevElem = $('#'+that.getLineView(newModelContext.prev, outline.rootID).id);
                        prevElem.after(elem);
                    }
                }
                // do this after rNewLinePlaceholder has been replaced, so correct element is visible.
                if (that.options.dockElem) {
                    $(document.body).removeClass('transition-mode');
                    that.options.dockElem.parentNode.removeChild(that.options.dockElem);
                    that.options.dockElem = undefined;
                }

                if (createActiveLineView) { // todo: add classes in detached-mode instead of here?
                    activeLineView.theme(); // add classes and if there is content, fixHeight
                    if (activeLineView.value.get('collapsed')) {
                        $('#'+activeLineView.id).addClass('collapsed').addClass('branch').removeClass('leaf');
                    } else {
                        if (activeLineView.value.get('children').length>0) {
                            $('#'+activeLineView.id).addClass('expanded').addClass('branch').removeClass('leaf');
                        } else {
                            $('#'+activeLineView.id).addClass('expanded').addClass('leaf').removeClass('branch');
                        }
                    }
                }

                // fix activeLineView's top/bottom corners
                activeLineView.themeFirst(); // could check if this two are strictly necessary
                activeLineView.themeLast();

                // fixup new neighborhood
                if (newModelContext.next && (newModelContext.prev == null)) {
                    $('#'+activeLineView.id).next().removeClass('ui-first-child');
                }
                if (newModelContext.prev && (newModelContext.next == null)) {
                    $('#'+activeLineView.id).prev().removeClass('ui-last-child');
                }
                if ((newModelContext.prev==null)&&(newModelContext.next==null)) {
                    // todo: could parentView be outline-root?
                    // adding child to expanded parent
                    var elem = $('#'+activeLineView.parentView.parentView.id);
                    elem.addClass('branch').removeClass('leaf');
                }
            }
            // remove source-placeholder
            if (r.rOldLinePlaceholder[outline.rootID]) {
                console.log('Removing oldlinePlaceholder for '+outline.rootID);
                r.rOldLinePlaceholder[outline.rootID].parentNode.removeChild(that.runtime.rOldLinePlaceholder[outline.rootID]);
                r.rOldLinePlaceholder[outline.rootID] = undefined;
                r.activeLineElem[outline.rootID] = undefined;
                r.activeLineHeight[outline.rootID] = undefined;
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

            // check if this view breadcrumbs were modified, if activeID is ancestor of outline.
            if (!activeLineView) {
                var model = outline.rootModel;
                while (model && (model.cid !== that.options.activeID)) {
                    model = model.get('parent');
                }
                if (model) {
                    outline.panelView.breadcrumbs.onDesign();
                    outline.panelView.breadcrumbs.renderUpdate();
                    outline.panelView.breadcrumbs.theme();
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

        var li = new templateView({cssClass: 'leaf'}); // todo -- merge with nestedsortable
        if (this.options.activeID) {
            li.modelId = this.options.activeID;
            var item = $D.OutlineNodeModel.getById(this.options.activeID);
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

    // must be called before placeholders inserted
    getLineContext: function(view) {
        var type = 'next', r = this.runtime;
        var elem = $('#'+view.id);
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
            }
        }
    },
    getOldContext: function() {
        if (! this.options.activeID) {
            this.oldModelContext = null;
        } else {
            this.oldModelContext = this.getContextAt(this.options.activeID);
        }
    },
    execModel: function () {
        var that = this, newModelContext;
        if (this.undo) {
            newModelContext = this.oldModelContext;
        } else {
            newModelContext = this.newModelContext;
        }
        this.addQueue('modelCreate', ['context'], function() {
            if (!that.options.activeID) {
                var activeModel = new $D.OutlineNodeModel({text: that.options.text, children: null});
                that.options.activeID = activeModel.cid;
            }
        });
        this.restoreContext();
    },
    execView:function (outline) {
        var that = this;
        this.restoreViewContext(outline);
    }
});

_.extend($D.OutlineAction.prototype, $D.animHelpers);


