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
            oldModelContext: null,
            newModelContext: null
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
                newLinePlace: {}
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
        if (o.anim === 'indent') {this.disableAnimation = true;}
    }

    getAncestorList(m:OutlineNodeModel, l) {
        if (m == null) {
            return l;
        }
        l.unshift(m);
        return this.getAncestorList(m.get('parent'), l);
    }

    findCommonAncestor(p1:OutlineNodeModel, p2:OutlineNodeModel, isPrev?:boolean) {
        var i:number;
        var a1 = this.getAncestorList(p1, []);
        var a2 = this.getAncestorList(p2, []);
        assert(a1[0] === a2[0], "Ancestors do not have common root");
        for (i = 0; (i < a1.length) && (i < a2.length); ++i) {
            if (a1[i] !== a2[i]) {
                //console.log('findCommonAncestor 1');
                break;
            } else {
                //console.log('findCommonAncestor 2');
            }
        }
        // now determine whether a1 or a2 if first.
        assert(i !== a1.length, "i==a1.length");
        if (i === a1.length) { // contradcition: a1 is the target, should never happen?
            //console.log('findCommonAncestor 3');
            return {
                parent: a1[i - 2],
                child1: a1[i - 1],
                child2: a1[i - 1],
                reversed: isPrev
            };
        } else if (i === a2.length) { // a2 is the target,
            //console.log('findCommonAncestor 4');
            return {
                parent: a1[i - 2],
                child1: a1[i - 1],
                child2: a1[i - 1],
                reversed: !isPrev // if target is really prev of target, then its reversed
            };
        } else {
            // console.log('findCommonAncestor 5');
        }
        var c1:string = a1[i].cid;
        var c2:string = a2[i].cid;
        var l:OutlineNodeCollection = a1[i - 1].get('children');
        var reversed:boolean;
        while (true) {
            if (c1 === a2[i].cid) {
                reversed = false;
                //console.log('findCommonAncestor 6');
                break;
            }
            if (c2 === a1[i].cid) {
                reversed = true;
                //console.log('findCommonAncestor 7');
                break;
            }
            if (c1 !== '') {
                //console.log('findCommonAncestor 8');
                c1 = l.next[c1];
            } else {
                //console.log('findCommonAncestor 9');
            }
            if (c2 !== '') {
                c2 = l.next[c2];
                //console.log('findCommonAncestor 10');
            } else {
                //console.log('findCommonAncestor 11');
            }
            assert((c1 !== '') || (c2 !== ''), "We cannot connect the ancestors");
        }
        return {
            parent: a1[i - 1],
            child1: a1[i],
            child2: a2[i],
            reversed: reversed
        };
    }

    runinit2() {
        var o:ActionOptions = this.options,
            r:RuntimeOptions = this.runtime,
            i:string, ancestors;
        if (o.undo) {
            r.rOldModelContext = this.newModelContext;
            r.rNewModelContext = this.oldModelContext;
        } else {
            r.rOldModelContext = this.oldModelContext;
            r.rNewModelContext = this.newModelContext;
        }
        if (r.rNewModelContext==null) {
            this.focusFirst = true;
        } else {
            this.focusFirst = false;
        }
        if (this.options.anim === 'indent') {this.disableAnimation = true;}
        if (!this.disableAnimation) {
            var stop1:{top?:string;end?:string;plusone?:boolean} = null,
                stop2:{top?:string;end?:string;plusone?:boolean} = null,
                reversed:boolean;
            var isMove = false;
            var moveOutline = {};
            var that = this;
            (function() { // function for profiling
                if ((that.newModelContext != null) && (that.oldModelContext != null)) {
                    for (i in OutlineRootView.outlinesById) {
                        // for each view, determine if start and stop destinations are visible.
                        var p1:ListView = that.contextParentVisible(r.rOldModelContext, OutlineRootView.outlinesById[i]);
                        var p2:ListView = that.contextParentVisible(r.rNewModelContext, OutlineRootView.outlinesById[i]);
                        if ((p1 != null) && (p2 !== null)) { // both parents are visible in this panel
                            // and neither is collapsed
                            if ((!p1.nodeView || !p1.nodeView.isCollapsed) &&
                                (!p2.nodeView || !p2.nodeView.isCollapsed)) {
                                // we are moving within the same visible outline
                                isMove = true;
                                moveOutline[i] = true;
                                //console.log("Outline-runinit 1");
                            } else {
                                //console.log("Outline-runinit 2");
                            }
                        } else {
                            //console.log("Outline-runinit 3");
                        }
                    }
                    if (isMove) {
                        // special case for step-forward/step-back
                        if (r.rNewModelContext.prev === o.activeID) {
                            assert(false, "This should never be possible");
                            // stop1 = {top: o.activeID};
                            // stop2 = {top: o.activeID};
                            // reversed = false;
                        } else if (r.rNewModelContext.next === o.activeID) {
                            assert(false, "This should never be possible");
                            // stop1 = {top: o.activeID};
                            // stop2 = {top: o.activeID};
                            // reversed = true;
                        } else {
                            assert(o.activeID !== r.rNewModelContext.parent, "");
                            if (r.rNewModelContext.prev) {
                                ancestors = that.findCommonAncestor(OutlineNodeModel.getById(o.activeID),
                                    OutlineNodeModel.getById(r.rNewModelContext.prev), true);
                                if (ancestors.child2.cid === r.rNewModelContext.prev) {
                                    ancestors.child2b = OutlineNodeModel.getById(o.activeID);
                                    //console.log("Outline-runinit 4");
                                } else {
                                    ancestors.child2b = ancestors.child2;
                                    //console.log("Outline-runinit 6");
                                }
                            } else if (r.rNewModelContext.next) {
                                ancestors = that.findCommonAncestor(OutlineNodeModel.getById(o.activeID),
                                    OutlineNodeModel.getById(r.rNewModelContext.next), false);
                                if (ancestors.child2.cid === r.rNewModelContext.next) {
                                    ancestors.child2b = OutlineNodeModel.getById(o.activeID);
                                    //console.log("Outline-runinit 5");
                                } else {
                                    ancestors.child2b = ancestors.child2;
                                    //console.log("Outline-runinit 7");
                                }
                            } else {
                                ancestors = that.findCommonAncestor(OutlineNodeModel.getById(o.activeID),
                                    OutlineNodeModel.getById(r.rNewModelContext.parent), false);
                                //console.log("Outline-runinit 8");
                                ancestors.child2b = ancestors.child2;
                            }
                            reversed = ancestors.reversed;
                            if (reversed) { // moving up in outline
                                stop1 = {top: ancestors.child1.cid};
                                stop2 = {top: ancestors.child2b.cid, end: ancestors.child1.cid};
                                //console.log("Outline-runinit 9");
                            } else { // moving down in outline
                                stop1 = {top: ancestors.child1.cid, end: ancestors.child2.cid};
                                stop2 = {top: ancestors.child2b.cid};
                                //console.log("Outline-runinit 10");
                            }
                            // check if we need to adjust 'to' based on special cases.
                            /*
                             if (p2.nodeView.value === ancestors.parent) { // destination-parent is ancestor of origin
                             if (reversed) { // moving up in outline
                             // prev or next or parent should be harmless
                             } else { // moving down in outline, parent should be harmless
                             if (r.rNewModelContext.prev) {
                             // need to go one step after this
                             stop2.plusone = true;
                             }
                             else if (r.rNewModelContext.next) {
                             assert(false, "This should not be possible");
                             }
                             }
                             }
                             */
                        }
                    }
                }
            })();
            // new height pushes up, and reposition-children-after
            // at top level do height and moving children only
            this.dropSource = new NodeDropSource({
                useDock: (r.rNewModelContext != null),
                usePlaceholder: true,
                activeID: this.options.activeID,
                rNewModelContext: r.rNewModelContext,
                outlineID: r.rOldRoot,
                dockView: this.options.dockView,
                stopOutlines: moveOutline,
                stopAt: stop1,
                reversed: reversed
            });
            // Todo: If it's a different height than NodeDropSource, NodeDropTarget should modify post-child-offsets & height by diff
            this.dropTarget = new NodeDropTarget({
                rNewModelContext: r.rNewModelContext,
                activeID: this.options.activeID,
                outlineID: r.rNewRoot,
                oldOutlineID: r.rOldRoot,
                stopOutlines: moveOutline,
                stopAt: stop2,
                reversed: reversed
            });
        } // end of animation not disabled
    }

    validateOptions() {
        var o:ActionOptions = this.options,
            v = this._validateOptions;
        if ((v.requireActive || o.undo || o.redo) && !o.activeID && (this.type !== 'PanelRootAction')) {
            console.log("ERROR: Action " + this.type + " missing activeID");
            debugger;
        }
        if (v.requireReference && !o.referenceID) {
            console.log("ERROR: Action " + this.type + " missing referenceID");
            debugger;
        }
        if (!o.oldRoot || !o.newRoot) {
            console.log("ERROR: Action " + this.type + " missing oldRoot or newRoot");
            debugger;
        }
        if (o.oldRoot !== 'all') {
            if (!OutlineRootView.outlinesById[o.oldRoot] && !(DeadView.viewList[o.oldRoot] instanceof DeadOutlineRoot)) {
                console.log('ERROR: Action ' + this.type + ' has invalid oldRoot');
                debugger;
            }
        }
        if ((o.newRoot !== 'all') && (o.newRoot !== 'new')) {
            if (!OutlineRootView.outlinesById[o.newRoot] && !(DeadView.viewList[o.newRoot] instanceof DeadOutlineRoot)) {
                console.log('ERROR: Action ' + this.type + ' has invalid newRoot');
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
                console.log('ERROR: invalid activeModel for activeID=' + o.activeID);
                debugger;
            }
            if (v.requireOld && !o.undo) {
                if (o.oldRoot !== 'all') {
                    if (!activeModel.views || !activeModel.views[o.oldRoot]) {
                        console.log('ERROR: No old-view found for activeID=' + o.activeID);
                        debugger;
                    }
                }
            }
            if (v.requireNew && o.undo) {
                if (o.newRoot !== 'all') {
                    if (!activeModel.views || !activeModel.views[o.newRoot]) {
                        console.log('ERROR: No new-view found for activeID=' + o.activeID);
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
                console.log('ERROR: invalid refModel for activeID=' + o.activeID);
                debugger;
            }
            // reference is only used in newRoot, not oldRoot
            if (v.requireNew || v.requireNewReference) {
                if (!refModel.views || !refModel.views[o.newRoot]) {
                    console.log('ERROR: No new-view found for referenceID=' + o.referenceID);
                    debugger;
                }
            }
            if (v.requireNewReference && o.undo) {
                if (o.newRoot !== 'all') {
                    if (!activeModel.views || !activeModel.views[o.newRoot]) {
                        if (!refModel.views[o.newRoot].isCollapsed) {
                            console.log('ERROR: Missing newRoot for activeID=' + o.activeID);
                            debugger;
                        }
                    }
                }
            }
        }
    }

    validateOldContext() {
        var context, o = this.options;
        if ((o.anim === 'dock') || (o.anim === 'indent')) {
            if ((this.newModelContext == null) || (this.oldModelContext == null)) {
                console.log("ERROR: Anim=" + o.anim + " but old or new context is null");
                debugger;
            }
        }
        if (o.undo) {
            context = this.newModelContext;
            if (this.type === 'DeleteAction') {
                if (context !== null) {
                    console.log("ERROR: DeleteAction undo with newModelContext-not-null");
                    debugger;
                }
                return;
            }
        } else {
            context = this.oldModelContext;
            if (this.type === 'InsertAfterAction') {
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
            if (this.type === 'InsertAfterAction') {
                if (context !== null) {
                    console.log("ERROR: Insert action with oldModelContext not-null");
                    debugger;
                }
                return;
            }
        } else {
            context = this.newModelContext;
            if (this.type === 'DeleteAction') {
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
                assert(context.prev === null, 'ERROR: context.prev is not null though rank=0');
            } else {
                assert(context.prev === collection.prev[model.cid],
                    'ERROR: context.prev does not match');
            }
            if (model.cid === collection.last()) {
                assert(context.next === null, 'ERROR: context.next is not null');
            } else {
                assert(context.next === collection.next[model.cid],
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
    getFocusNode():NodeView {
        if (this.focusFirst) {
            var newRoot, li:NodeView, model, collection, rank, cursor:number;
            this.runtime.cursorstart = false;
            var context= this.runtime.rOldModelContext;
            newRoot = this.runtime.rNewRoot;
            if (context.prev == null) {
                // check if parent is visible
                li = null;
                if (context.parent != null) {
                    li = this.getNodeView(context.parent, newRoot);
                }
                if (!li) { // try following sibling
                    if (context.next == null) {
                        return; // no other elements in view
                    }
                    li = this.getNodeView(context.next, newRoot);
                    this.runtime.cursorstart = true;
                }
            } else { // goto prior sibling.
                li = this.getNodeView(context.prev, newRoot);
                if (!li) {
                    console.log('ERROR: Missing prior view for focus');
                    debugger;
                }
            }
            return li;
        } else {
            return super.getFocusNode();
        }
    }
    placeCursor(text:TextAreaView) {
        if (this.focusFirst) { // activeID is being deleted
            var cursor = 0;
            if (!this.runtime.cursorstart) {
                cursor = text.getValue().length;
            }
            if ($D.is_android) {
                cursor += 1;
            }
            text.setCursor(cursor);
        } else {
            if ($D.is_android) {
                text.setCursor(1);
            } else {
                text.setCursor(0);
            }
        }
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
        assert(context.parent != null, "context.parent is null");
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
            if (activeModel.get('parent') != null) {
                oldCollection = activeModel.attributes.parent.attributes.children;
            } else {
                oldCollection = null
            }
        });
        this.addQueue('oldModelRemove', ['oldModelCollection'], function() {
            // if parent-collection is empty, reset collapsed=false
            if (oldCollection != null) {
                if ((!that.options.undo) && (!that.options.redo) &&
                    (oldCollection.count === 1) && (that.type !== 'CollapseAction')) {
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
                if (newModelContext.prev == null) {
                    collection.insertAfter(activeModel.cid, activeModel, '');
                } else {
                    collection.insertAfter(activeModel.cid, activeModel, newModelContext.prev);
                }
                activeModel.set('parent', OutlineNodeModel.getById(newModelContext.parent));
            } else {
                assert(activeModel.attributes.children.count === 0,
                    "Cannot delete node with children");
                activeModel.delete();
            }
        });
    }

    restoreViewContext(outline) {
        var that = this;
        assert(outline.id === outline.nodeRootView.id, "Invalid outline in restoreViewContext");
        var deps = ['newModelAdd', 'anim', 'focusFirst'];
        this.addQueue(['view', outline.id], deps, function() {
            var
                r:RuntimeOptions = that.runtime,
                newModelContext:ModelContext,
                elem:JQuery,
                newListView:ListView,
                createActiveLineView:boolean = false;
            newModelContext = r.rNewModelContext;
            // oldViewVisible, newViewVisible, oldParent, newParent, oldList, newList
            var activeNodeView = that.getNodeView(that.options.activeID, outline.id);
            // get parent listview; unless newModelContext is not in this view, then null
            newListView = that.contextParentVisible(newModelContext, outline);
            console.log('Restoring "view" for outline '+outline.id);
            if (newListView && newListView.hideList) {
                newListView = null;
            }
            if (!newListView) {
                newListView = null;
                newModelContext = null;
            }
            if (newModelContext === null) {
                // console.log('Have newModelContext = null for outline='+outline.id);
                if (activeNodeView != null) {
                    activeNodeView.destroy();
                    // destroy() also detaches view-reference from model, and removes from listItems
                }
            } else {
                if (activeNodeView == null) { // create
                    activeNodeView = new newListView.listItemTemplate({
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
                if (newModelContext.prev == null) {
                    newListView.insertAfter(null, activeNodeView);
                } else {
                    newListView.insertAfter(
                        that.getNodeView(newModelContext.prev, outline.id),
                        activeNodeView);
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
        var elem = $('#' + view.id);
        var oldspot = elem.next('li');
        if (oldspot.length === 0) {
            oldspot = elem.prev('li');
            type = 'prev';
        }
        if (oldspot.length > 0) {
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
        if (!this.options.activeID) {
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


