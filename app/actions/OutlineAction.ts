///<reference path="Action.ts"/>

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
m_require("app/actions/PlaceholderAnimAction.js");

class OutlineAction extends PlaceholderAnimAction {
    oldModelContext:ModelContext;
    newModelContext:ModelContext;
    oldType:string;
    newType:string;
    useOldLinePlaceholder:boolean;
    useNewLinePlaceholder:boolean;
    _validateOptions;
    init() {
        Action.prototype.init.call(this, arguments);
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
    }
    runinit() {
        Action.prototype.runinit.call(this, arguments);
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
        var o:ActionOptions = this.options, r:RuntimeOptions = this.runtime;
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
    }
    runinit2() {
        var o:ActionOptions = this.options,
            r:RuntimeOptions = this.runtime;
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


        var outlines = OutlineManager.outlines;
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
    }

    validateOptions() {
        var o:ActionOptions = this.options,
            v = this._validateOptions;
        if ((v.requireActive || o.undo || o.redo) && !o.activeID && (this.type !== 'PanelRootAction')) {
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
            if (!OutlineManager.outlines[o.oldRoot] && !OutlineManager.deleted[o.oldRoot]) {
                console.log('ERROR: Action '+this.type+' has invalid oldRoot');
                debugger;
            }
        }
        if ((o.newRoot !== 'all')&&(o.newRoot!=='new'))  {
            if (!OutlineManager.outlines[o.newRoot] && !OutlineManager.deleted[o.newRoot]) {
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
    }

    validateOldContext() {
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
    }

    validateNewContext() {
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
    }

    validateContext(context) {
        var o:ActionOptions = this.options;
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
        /*
        if (o.text) {
            // todo:
        }
        if (o.collapsed !== undefined) {
            // todo:
        }
        if (o.focus) {
            // todo:
        }
        */
    }
    contextStep() {
        this.getOldContext();
        this.getNewContext();
    }
    getModel(id) {
        return OutlineNodeModel.getById(id);
    }
    getLineView(id, rootid) {
        var model = this.getModel(id);
        if (model.views == null) {return null;}
        return model.views[rootid];
    }
    // todo: should make node-model a doubly-linked list without relying on collection rank?
    getContextAt(id) {
        var model = this.getModel(id);
        var collection= model.parentCollection();
        var rank = model.rank();
        var context:ModelContext = {};
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
    }
    // return the context for an item inserted after id
    getContextAfter(id) {
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
    }
    // return the context for an item inserted before id
    getContextBefore(id) {
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
    }
    // return the context for an item inserted inside id, at end of list
    getContextIn(id) {
        var reference = OutlineNodeModel.getById(id);
        var collection = reference.get('children');
        var context:ModelContext = {parent: id, next: null};
        if (collection.length===0) {
            context.prev = null;
        } else {
            context.prev = collection.at(collection.length-1).cid;
        }
        return context;
    }
    newModel() {
        var activeModel = new OutlineNodeModel({
            text: this.options.text,
            children: null
            });
        this.options.activeID = activeModel.cid;
        return activeModel;
    }
    getContextType(context, outline) {
        if (!context) {return 'none';}

        if (context.parent != null) {
            var parent = this.getLineView(context.parent, outline.nodeRootView.id);
            if (parent != null) {
                if ($('#'+parent.id).hasClass('collapsed')) {
                    return 'parentIsCollapsedLine';
                } else {
                    return 'parentIsExpandedLine';
                }
            } else { // parent is outside view, is it one level or more?
                if (this.getModel(context.parent).get('children') ===
                    View.get(outline.nodeRootView.id).value) {
                    return 'parentIsRoot';
                } else { // context is out of scope
                    return 'parentInvisible';
                    // might be under collapsed item or outside it
                }
            }
        } else { // outline-root $D.data
            if (View.get(outline.nodeRootView.id).value === $D.data) {
                return 'parentIsRoot';
            } else {
                return 'parentInvisible';
                // context is outside of outline
                console.log('called getContext with no parent but not at root');
                debugger;
                return null;
            }
        }
    }
    contextParentVisible(context, outline):NodeView {
        if (!context) {return null;}

        if (context.parent != null) {
            var parent = this.getLineView(context.parent, outline.nodeRootView.id);
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
                    View.get(outline.nodeRootView.id).value) {
                    return View.get(outline.nodeRootView.id);
                } else { // context is out of scope
                    return null;
                }
            }
        } else { // outline-root $D.data
            if (View.get(outline.nodeRootView.id).value === $D.data) {
                return View.get(outline.nodeRootView.id);
            } else {
                return null;
            }
        }
    }
    restoreContext() {
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
                            action: CollapseAction,
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
    }

    restoreViewContext(outline) {
        var that = this;
        assert(outline.id === outline.nodeRootView.id, "Invalid outline in restoreViewContext");
        this.addQueue(['view', outline.id], ['newModelAdd', 'anim'], function() {
            var r:RuntimeOptions= that.runtime;
            var collection, rank:number, oldParent, oldParentView:View=null;
            var newModelContext, li, elem, oldspot, neighbor, neighborType, newParentView:NodeView, createActiveLineView:boolean=false;

            newModelContext = r.rNewModelContext;
            // todo: this is a mess, with placeholders and undo.  Need to simplify.
            var activeLineView = that.getLineView(that.options.activeID, outline.id);
            // activeLineView should not be affected by rOldLinePlaceholder, except for DOM presence
            if (activeLineView!=null) { // original element was visible in this view
                if (!r.oldLineContext[outline.id]) {
                    console.log("ERROR: Oldspot does not exist for action "+that.type+
                        "; undo="+that.options.undo+"; redo="+that.options.redo+
                        "; activeID="+that.options.activeID+"; view="+outline.id);
                    debugger;
                }
                // should get this earlier, per view, like rNewLineContext
                neighbor = r.oldLineContext[outline.id].obj;
                neighborType = r.oldLineContext[outline.id].type;
            } else { // if old-view isn't visible, check if parent needs collapse-update
                // todo: can oldParent be replaced with a newModelContext-newParentView instead?
                if (that.options.undo) {
                    if (that.newModelContext) {
                        oldParent = that.getModel(that.newModelContext.parent);
                    }
                } else if (that.oldModelContext) {
                    oldParent = that.getModel(that.oldModelContext.parent);
                }
                if (oldParent && oldParent.views && oldParent.views[outline.id]) {
                    oldParentView = oldParent.views[outline.id];
                }
            }
            // oldParentView != null means it needs to be checked if it changed to a leaf

            // get parent listview; unless newModelContext is not in this view, then null
            newParentView = that.contextParentVisible(newModelContext, outline);
            if (newParentView && newParentView.isCollapsed) {
                // adding child to collapsed parent
                newParentView.addClass('branch').removeClass('leaf');
                console.log('Nulling newModelContext because parent isnt visible');
                newParentView = null;
            }

            if (!newParentView) {newParentView=null; newModelContext = null;}


            if (newModelContext === null) {
                console.log('Have newModelContext = null for outline='+outline.id);
                if (activeLineView != null) {activeLineView.destroy();}
                // destroy() also detaches view-reference from model
            } else {
                if (activeLineView == null) { // create
                    activeLineView= new newParentView.listItemTemplateView({
                        parentView: newParentView,
                        value: OutlineNodeModel.getById(that.options.activeID),
                        cssClass: 'leaf'
                    });
                    elem = $(activeLineView.render());
                    createActiveLineView = true;
                } else { // move
                    if (r.activeLineElem[outline.id] && r.activeLineElem[outline.id].id === activeLineView.id) {
                        elem = $(r.activeLineElem[outline.id]);
                        r.activeLineElem[outline.id] = undefined;
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
                if (r.rNewLinePlaceholder[outline.id]) {
                    console.log('Replacing newlinePlaceholder for '+outline.id);
                    r.rNewLinePlaceholder[outline.id].parentNode.
                        replaceChild(elem[0], r.rNewLinePlaceholder[outline.id]);
                } else {
                    if (newModelContext.prev == null) {
                        var parentElem = $('#'+newParentView.id);
                        parentElem.prepend(elem);
                    } else {
                        var prevElem = $('#'+that.getLineView(newModelContext.prev, outline.id).id);
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
                    activeLineView.header.name.text.fixHeight(); // add classes and if there is content, fixHeight
                    if (activeLineView.value.get('collapsed')) {
                        activeLineView.addClass('collapsed').addClass('branch').removeClass('leaf');
                    } else {
                        if (activeLineView.value.get('children').length>0) {
                            activeLineView.addClass('expanded').addClass('branch').removeClass('leaf');
                        } else {
                            activeLineView.addClass('expanded').addClass('leaf').removeClass('branch');
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
            if (r.rOldLinePlaceholder[outline.id]) {
                console.log('Removing oldlinePlaceholder for '+outline.id);
                r.rOldLinePlaceholder[outline.id].parentNode.removeChild(that.runtime.rOldLinePlaceholder[outline.id]);
                r.rOldLinePlaceholder[outline.id] = undefined;
                r.activeLineElem[outline.id] = undefined;
                r.activeLineHeight[outline.id] = undefined;
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
                var model = outline.panelView.value;
                while (model && (model.cid !== that.options.activeID)) {
                    model = model.get('parent');
                }
                if (model) {
                    outline.panelView.breadcrumbs.updateValue();
                    outline.panelView.breadcrumbs.renderUpdate();
                }
            }
        });
    }
    // utility functions
    newListItemView(parentView) { // (id only if known)
        // todo: update parentView.listItems
    }

    // must be called before placeholders inserted
    getLineContext(view) {
        var type:string = 'next', r:RuntimeOptions = this.runtime;
        var elem = $('#'+view.id);
        var oldspot = elem.next('li');
        if (oldspot.length===0) {
            oldspot = elem.prev('li');
            type = 'prev';
        }
        if (oldspot.length>0) {
            return {type: type, obj: View.get(oldspot.attr('id'))};
        } else {
            if (view.parentView.parentView && view.parentView.parentView instanceof NodeView) {
                return {type: 'parent', obj: view.parentView.parentView};
            } else {
                return {type: 'root', obj: View.get(view.nodeRootView.id)}
            }
        }
    }
    getOldContext() {
        if (! this.options.activeID) {
            this.oldModelContext = null;
        } else {
            this.oldModelContext = this.getContextAt(this.options.activeID);
        }
    }
    execModel() {
        var that = this, newModelContext:ModelContext;
        if (this.undo) {
            newModelContext = this.oldModelContext;
        } else {
            newModelContext = this.newModelContext;
        }
        this.addQueue('modelCreate', ['context'], function() {
            if (!that.options.activeID) {
                var activeModel = new OutlineNodeModel({text: that.options.text, children: null});
                that.options.activeID = activeModel.cid;
            }
        });
        this.restoreContext();
    }
    execView(outline) {
        var that = this;
        this.restoreViewContext(outline);
    }
    getNewContext();
}


