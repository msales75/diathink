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
m_require("app/actions/AnimatedAction.js");

class OutlineAction extends AnimatedAction {
    oldModelContext:ModelContext;
    newModelContext:ModelContext;
    _validateOptions;
    init() {
        super.init();
        _.extend(this, {
            oldModelContext:null,
            newModelContext:null
        });
    }
    runinit() {
        super.runinit.call(this, arguments);
        _.extend(this.runtime, {
            oldLineContext: {},
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
                createDockElem: 0,
                dockAnim: 0,
                panelPrep: 0,
                anim: 0,
                oldLinePlace: {},
                newLinePlace: {},
                linePlaceAnim: {}
            }
        });
        var o:ActionOptions = this.options,
            r:RuntimeOptions = this.runtime;
        if (o.undo) {
            r.rNewRoot = o.oldRoot;
            r.rOldRoot = o.newRoot;
        } else {
            r.rNewRoot = o.newRoot;
            r.rOldRoot = o.oldRoot;
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
        this.dropSource = new NodeDropSource({
            activeID: this.options.activeID,
            outlineID: r.rOldRoot,
            dockElem:this.options.dockElem
        });
        this.dropTarget = new NodeDropTarget({
            rNewModelContext: r.rNewModelContext,
            activeID:this.options.activeID,
            outlineID: r.rNewRoot,
            oldOutlineID: r.rOldRoot
        });
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
            if (!OutlineRootView.outlinesById[o.oldRoot] && !(DeadView.viewList[o.oldRoot] instanceof DeadOutlineRoot)) {
                console.log('ERROR: Action '+this.type+' has invalid oldRoot');
                debugger;
            }
        }
        if ((o.newRoot !== 'all')&&(o.newRoot!=='new'))  {
            if (!OutlineRootView.outlinesById[o.newRoot] && !(DeadView.viewList[o.newRoot] instanceof DeadOutlineRoot)) {
                console.log('ERROR: Action '+this.type+' has invalid newRoot');
                debugger;
            }
        }

        if (o.anim) {}

        if (o.activeID) {
            var activeModel = OutlineNodeModel.getById(o.activeID);
            if (!activeModel) {
                activeModel = OutlineNodeModel.deletedById[o.activeID];
            }
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
            var refModel = OutlineNodeModel.getById(o.referenceID);
            if (!refModel) {
                refModel = OutlineNodeModel.deletedById[o.referenceID];
            }
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
                        if (! refModel.views[o.newRoot].isCollapsed) {
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

    validateContext(context:ModelContext) {
        var o:ActionOptions = this.options;
        // otherwise context must exist
        if (o.activeID != null) {
            var model:OutlineNodeModel = OutlineNodeModel.getById(o.activeID);
            assert(context.parent === model.get('parent').cid, "context.parent does not match");
            var collection = model.parentCollection();
            // var rank = model.rank();
            if (model.cid === collection.first()) {
                assert(context.prev===null, 'ERROR: context.prev is not null though rank=0');
            } else {
                assert (context.prev === collection.prev[model.cid],
                    'ERROR: context.prev does not match');
            }
            if (model.cid === collection.last()) {
                assert (context.next === null, 'ERROR: context.next is not null');
            } else {
                assert (context.next === collection.next[model.cid],
                    'ERROR: context.next does not match');
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

    newModel() {
        var activeModel = new OutlineNodeModel({
            text: this.options.text,
            children: null
            });
        this.options.activeID = activeModel.cid;
        return activeModel;
    }

    getContextType(context:ModelContext, outline) {
        if (!context) {return 'none';}
        assert(context.parent!=null, "context.parent is null");
        if (context.parent !== OutlineNodeModel.root.cid) {
            var parent = this.getNodeView(context.parent, outline.nodeRootView.id);
            if (parent != null) {
                if (parent.isCollapsed) {
                    return 'parentIsCollapsedLine';
                } else {
                    return 'parentIsExpandedLine';
                }
            } else { // parent is outside view, is it one level or more?
                if (OutlineNodeModel.getById(context.parent).get('children') ===
                    View.get(outline.nodeRootView.id).value) {
                    return 'parentIsRoot';
                } else { // context is out of scope
                    return 'parentInvisible';
                    // might be under collapsed item or outside it
                }
            }
        } else { // context is at top-level of model outline
            if (View.get(outline.nodeRootView.id).value.get('parent') === OutlineNodeModel.root) {
                assert(outline.panelView.value === OutlineNodeModel.root, "Panelview is wrong");
                return 'parentIsRoot';
            } else {
                return 'parentInvisible'; // context is outside of outline
            }
        }
    }
    contextParentVisible(context:ModelContext, outline):ListView {
        if (!context) {return null;}
        assert(context.parent != null, "context is null");

            var parent:NodeView = this.getNodeView(context.parent, outline.nodeRootView.id);
            if (parent != null) {
                return parent.children;
            } else { // parent is outside view, is it one level or more?
                if (OutlineNodeModel.getById(context.parent).get('children') ===
                    View.get(outline.nodeRootView.id).value) {
                    return outline.nodeRootView;
                } else { // context is out of scope
                    return null;
                }
            }
}
    restoreContext() {
        var activeModel:OutlineNodeModel, collection:OutlineNodeCollection, oldCollection:OutlineNodeCollection;
        var that = this;
        this.addQueue('oldModelCollection', ['modelCreate'], function() {
            activeModel = OutlineNodeModel.getById(that.options.activeID);
            if (!activeModel) {
                activeModel = OutlineNodeModel.deletedById[that.options.activeID];
                activeModel.resurrect();
            }
            // check for resurrection
            if (activeModel.get('parent')!=null) {
                oldCollection = activeModel.attributes.parent.attributes.children;
            } else {
                oldCollection = null
            }
        });
        this.addQueue('oldModelRemove', ['oldModelCollection'], function() {
                // if parent-collection is empty, reset collapsed=false
            if (oldCollection != null) {
                if ((!that.options.undo)&&(!that.options.redo)&&
                    (oldCollection.count===1)&&(that.type!=='CollapseAction')) {
                    var parent = activeModel.get('parent');
                    // don't do this with a collapse action.
                    that.subactions.push({
                        actionType: CollapseAction,
                        activeID: parent.cid,
                        collapsed: false,
                        oldRoot: 'all',
                        newRoot: 'all',
                        focus: false
                    });
                }
                oldCollection.remove(activeModel.cid);
                activeModel.set('parent', null);
            }
        });
        this.addQueue('newModelRank', ['oldModelRemove'], function() {});

        this.addQueue('newModelAdd', ['newModelRank'], function() {
            var newModelContext;
            if (that.options.undo) {
                newModelContext = that.oldModelContext;
            } else {
                newModelContext = that.newModelContext;
            }
            if (newModelContext != null) {
                collection = OutlineNodeModel.getById(newModelContext.parent).get('children');
                if (newModelContext.prev==null) {
                    collection.insertAfter(activeModel.cid, activeModel, '');
                } else {
                    collection.insertAfter(activeModel.cid, activeModel, newModelContext.prev);
                }
                activeModel.set('parent', OutlineNodeModel.getById(newModelContext.parent));
            } else {
                assert(activeModel.attributes.children.count===0,
                    "Cannot delete node with children");
                activeModel.delete();
            }
        });
    }

    restoreViewContext(outline) {
        var that = this;
        assert(outline.id === outline.nodeRootView.id, "Invalid outline in restoreViewContext");
        this.addQueue(['view', outline.id], ['newModelAdd', 'anim'], function() {
            var
                r:RuntimeOptions=that.runtime,
                newModelContext:ModelContext,
                elem:JQuery,
                newListView:ListView,
                createActiveLineView:boolean=false;

            newModelContext = r.rNewModelContext;

            // oldViewVisible, newViewVisible, oldParent, newParent, oldList, newList

            var activeNodeView = that.getNodeView(that.options.activeID, outline.id);

            // get parent listview; unless newModelContext is not in this view, then null
            newListView = that.contextParentVisible(newModelContext, outline);
            if (newListView && newListView.hideList) {
                newListView = null;
            }

            if (!newListView) {newListView=null; newModelContext = null;}


            if (newModelContext === null) {
                // console.log('Have newModelContext = null for outline='+outline.id);
                if (activeNodeView != null) {
                    activeNodeView.destroy();
                    // destroy() also detaches view-reference from model, and removes from listItems
                }
            } else {
                if (activeNodeView == null) { // create
                    activeNodeView= new newListView.listItemTemplate({
                        parentView: newListView,
                        value: OutlineNodeModel.getById(that.options.activeID),
                        cssClass: 'leaf'
                    });
                    activeNodeView.render();
                } else { // detach from old location
                    // remove item from list in listItems
                    var oldListView = that.contextParentVisible(r.rOldModelContext, outline);
                    oldListView.detach(activeNodeView);
                    activeNodeView.changeParent(newListView);
                }

                // insert in new location
                if (newModelContext.prev==null) {
                    newListView.insertAfter(null, activeNodeView,
                        that.dropTarget.getPlaceholder(outline.id));
                } else {
                    newListView.insertAfter(
                        that.getNodeView(newModelContext.prev, outline.id),
                        activeNodeView, that.dropTarget.getPlaceholder(outline.id));
                }

            }

            // check if this view breadcrumbs were modified, if activeID is ancestor of outline.
            if (!activeNodeView) {
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
    getLineContext(view) { // todo: replace this with regular context
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
            this.oldModelContext = OutlineNodeModel.getById(this.options.activeID).getContextAt();
        }
    }
    execModel() {
        var that = this;
        this.addQueue('modelCreate', ['context'], function() {
            if (!that.options.activeID) {
                var activeModel = new OutlineNodeModel({
                    text: that.options.text,
                    children: null
                });
                that.options.activeID = activeModel.cid;
            }
        });
        this.restoreContext();
    }
    execView(outline) {
        var that = this;
        this.restoreViewContext(outline);
    }
    getNewContext() {}
}


