var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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

var OutlineAction = (function (_super) {
    __extends(OutlineAction, _super);
    function OutlineAction() {
        _super.apply(this, arguments);
    }
    OutlineAction.prototype.init = function () {
        _super.prototype.init.call(this);
        _.extend(this, {
            oldModelContext: null,
            newModelContext: null
        });
    };

    OutlineAction.prototype.runinit = function () {
        _super.prototype.runinit.call(this, arguments);
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
        var o = this.options, r = this.runtime;
        if (o.undo) {
            r.rNewRoot = o.oldRoot;
            r.rOldRoot = o.newRoot;
        } else {
            r.rNewRoot = o.newRoot;
            r.rOldRoot = o.oldRoot;
        }
        if (o.anim === 'indent') {
            this.disableAnimation = true;
        }
    };

    OutlineAction.prototype.getAncestorList = function (m, l) {
        if (m == null) {
            return l;
        }
        l.unshift(m);
        return this.getAncestorList(m.get('parent'), l);
    };

    OutlineAction.prototype.findCommonAncestor = function (p1, p2, isPrev) {
        var i;
        var a1 = this.getAncestorList(p1, []);
        var a2 = this.getAncestorList(p2, []);
        assert(a1[0] === a2[0], "Ancestors do not have common root");
        for (i = 0; (i < a1.length) && (i < a2.length); ++i) {
            if (a1[i] !== a2[i]) {
                break;
            } else {
                //console.log('findCommonAncestor 2');
            }
        }

        // now determine whether a1 or a2 if first.
        assert(i !== a1.length, "i==a1.length");
        if (i === a1.length) {
            //console.log('findCommonAncestor 3');
            return {
                parent: a1[i - 2],
                child1: a1[i - 1],
                child2: a1[i - 1],
                reversed: isPrev
            };
        } else if (i === a2.length) {
            //console.log('findCommonAncestor 4');
            return {
                parent: a1[i - 2],
                child1: a1[i - 1],
                child2: a1[i - 1],
                reversed: !isPrev
            };
        } else {
            // console.log('findCommonAncestor 5');
        }
        var c1 = a1[i].cid;
        var c2 = a2[i].cid;
        var l = a1[i - 1].get('children');
        var reversed;
        while (true) {
            if (c1 === a2[i].cid) {
                reversed = false;

                break;
            }
            if (c2 === a1[i].cid) {
                reversed = true;

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
    };

    OutlineAction.prototype.handleLineJoins = function () {
        this.cursorPosition = null;
        if (!this.options.undo && (this.runtime.rNewModelContext == null) && (!this.options.origID)) {
            var line1 = this.prevVisibleNode(this.runtime.rOldModelContext);
            if (!line1) {
                return;
            }
            var line2 = OutlineNodeModel.getById(this.options.activeID).views[this.runtime.rOldRoot];

            // var sel = this.options.cursor;
            var t1 = line1.header.name.text.value + line2.header.name.text.value;
            this.cursorPosition = line1.header.name.text.value.length;
            line1.header.name.text.setValue(t1);
            if ((!this.options.redo) && (line2.header.name.text.value.length > 0) && (!this.options.origID)) {
                this.subactions.push({
                    actionType: TextAction,
                    oldRoot: this.runtime.rOldRoot,
                    newRoot: this.runtime.rOldRoot,
                    activeID: line1.value.cid,
                    text: t1
                });
            }
            // send message to placeCursor() on where to put cursor
            // this should be where we do focus, checkTextChange can get this change after we focus there.
            /*
            if (line2.header.name.text.value.length > 0) {
            }
            */
        }
    };

    OutlineAction.prototype.handleLineSplits = function () {
        // is a line being created or destroyed
        if (!this.options.undo && !this.options.redo && (this.runtime.rOldModelContext == null) && (!this.options.origID)) {
            if (!OutlineNodeModel.getById(this.options.referenceID).views) {
                return;
            }
            var line1 = OutlineNodeModel.getById(this.options.referenceID).views[this.runtime.rOldRoot];
            if (!line1) {
                return;
            }
            var line2 = OutlineNodeModel.getById(this.options.activeID).views[this.runtime.rOldRoot];

            // either newline or undoing deletion?
            var sel = this.options.cursor;
            var t1, t2;
            var text = line1.header.name.text;
            t1 = text.value.substr(0, sel[0]);
            t2 = text.value.substr(sel[1]);
            text.setValue(t1);
            line2.header.name.text.setValue(t2);
            if (t2.length > 0) {
                this.subactions.push({
                    actionType: TextAction,
                    oldRoot: this.runtime.rOldRoot,
                    newRoot: this.runtime.rOldRoot,
                    activeID: this.options.referenceID,
                    text: t1
                });
                this.subactions.push({
                    actionType: TextAction,
                    oldRoot: this.runtime.rOldRoot,
                    newRoot: this.runtime.rOldRoot,
                    activeID: this.options.activeID,
                    text: t2
                });
            }
        }
    };

    OutlineAction.prototype.runinit2 = function () {
        var o = this.options, r = this.runtime, i, ancestors;
        if (o.undo) {
            r.rOldModelContext = this.newModelContext;
            r.rNewModelContext = this.oldModelContext;
        } else {
            r.rOldModelContext = this.oldModelContext;
            r.rNewModelContext = this.newModelContext;
        }
        if (r.rNewModelContext == null) {
            this.focusFirst = true;
        } else {
            this.focusFirst = false;
        }
        this.handleLineJoins();
        if (this.options.anim === 'indent') {
            this.disableAnimation = true;
        }
        if (!this.disableAnimation) {
            var stop1 = null, stop2 = null, reversed;
            var isMove = false;
            var moveOutline = {};
            var that = this;
            (function () {
                if ((that.newModelContext != null) && (that.oldModelContext != null)) {
                    for (i in OutlineRootView.outlinesById) {
                        // for each view, determine if start and stop destinations are visible.
                        var p1 = that.contextParentVisible(r.rOldModelContext, OutlineRootView.outlinesById[i]);
                        var p2 = that.contextParentVisible(r.rNewModelContext, OutlineRootView.outlinesById[i]);
                        if ((p1 != null) && (p2 !== null)) {
                            // and neither is collapsed
                            if ((!p1.nodeView || !p1.nodeView.isCollapsed) && (!p2.nodeView || !p2.nodeView.isCollapsed)) {
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
                                ancestors = that.findCommonAncestor(OutlineNodeModel.getById(o.activeID), OutlineNodeModel.getById(r.rNewModelContext.prev), true);
                                if (ancestors.child2.cid === r.rNewModelContext.prev) {
                                    ancestors.child2b = OutlineNodeModel.getById(o.activeID);
                                    //console.log("Outline-runinit 4");
                                } else {
                                    ancestors.child2b = ancestors.child2;
                                    //console.log("Outline-runinit 6");
                                }
                            } else if (r.rNewModelContext.next) {
                                ancestors = that.findCommonAncestor(OutlineNodeModel.getById(o.activeID), OutlineNodeModel.getById(r.rNewModelContext.next), false);
                                if (ancestors.child2.cid === r.rNewModelContext.next) {
                                    ancestors.child2b = OutlineNodeModel.getById(o.activeID);
                                    //console.log("Outline-runinit 5");
                                } else {
                                    ancestors.child2b = ancestors.child2;
                                    //console.log("Outline-runinit 7");
                                }
                            } else {
                                ancestors = that.findCommonAncestor(OutlineNodeModel.getById(o.activeID), OutlineNodeModel.getById(r.rNewModelContext.parent), false);

                                //console.log("Outline-runinit 8");
                                ancestors.child2b = ancestors.child2;
                            }
                            reversed = ancestors.reversed;
                            if (reversed) {
                                stop1 = { top: ancestors.child1.cid };
                                stop2 = { top: ancestors.child2b.cid, end: ancestors.child1.cid };
                                //console.log("Outline-runinit 9");
                            } else {
                                stop1 = { top: ancestors.child1.cid, end: ancestors.child2.cid };
                                stop2 = { top: ancestors.child2b.cid };
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
                useDock: (r.rNewModelContext != null) && (!this.options.origID),
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
        }
    };

    OutlineAction.prototype.validateOptions = function () {
        var o = this.options, v = this._validateOptions;
        if ((v.requireActive || o.undo || o.redo) && !o.activeID && (this.type !== 'PanelRootAction')) {
            console.log("ERROR: Action " + this.type + " missing activeID");
            debugger;
        }
        if (v.requireReference && !o.referenceID) {
            console.log("ERROR: Action " + this.type + " missing referenceID");
            debugger;
        }

        /*
        if (!o.origID && !o.copyID) {
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
        }
        */
        if (o.anim) {
        }
        if (o.activeID) {
            var activeModel = OutlineNodeModel.getById(o.activeID);
            if (!activeModel) {
                activeModel = OutlineNodeModel.deletedById[o.activeID];
            }
            if (!activeModel) {
                console.log('ERROR: invalid activeModel for activeID=' + o.activeID);
                debugger;
            }
            /*
            if (!o.origID && !o.copyID) {
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
            */
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
            /*
            if (!o.origID) {
            if (v.requireNew || v.requireNewReference) {
            assert(refModel.views, "referenceID does not have model");
            assert(refModel.views[o.newRoot] || (refModel === View.get(o.newRoot).panelView.value),
            "ERROR: NO new-view found for referenceID=" + o.referenceID);
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
            */
        }
    };

    OutlineAction.prototype.validateOldContext = function () {
        var context, o = this.options;
        if ((o.anim === 'dock') || (o.anim === 'indent')) {
            if ((this.newModelContext == null) || (this.oldModelContext == null)) {
                console.log("ERROR: Anim=" + o.anim + " but old or new context is null");
                debugger;
            }
        }
        if (o.undo) {
            context = this.newModelContext;
            if (this instanceof DeleteAction) {
                if (context !== null) {
                    console.log("ERROR: DeleteAction undo with newModelContext-not-null");
                    debugger;
                }
                return;
            }
        } else {
            context = this.oldModelContext;
            if ((this instanceof InsertAfterAction) || (this instanceof InsertIntoAction) || (this.options.copyID)) {
                if (context !== null) {
                    console.log("ERROR: Insert action with oldModelContext not-null");
                    debugger;
                }
                return;
            }
        }
        this.validateContext(context);
    };

    OutlineAction.prototype.validateNewContext = function () {
        // todo: verify that placeholders and helpers are all cleaned up,
        var context, o = this.options;
        if (o.undo) {
            context = this.oldModelContext;
            if ((this instanceof InsertAfterAction) || (this instanceof InsertIntoAction) || (this.options.copyID)) {
                if (context !== null) {
                    console.log("ERROR: Insert action with oldModelContext not-null");
                    debugger;
                }
                return;
            }
        } else {
            context = this.newModelContext;
            if (this instanceof DeleteAction) {
                if (context !== null) {
                    console.log("ERROR: DeleteAction undo with newModelContext-not-null");
                    debugger;
                }
                return;
            }
        }
        this.validateContext(context);
    };

    OutlineAction.prototype.validateContext = function (context) {
        var o = this.options;

        // otherwise context must exist
        if (o.activeID != null) {
            var model = OutlineNodeModel.getById(o.activeID);
            assert(context.parent === model.get('parent').cid, "context.parent does not match");
            var collection = model.parentCollection();

            // var rank = model.rank();
            if (model.cid === collection.first()) {
                assert(context.prev === null, 'ERROR: context.prev is not null though rank=0');
            } else {
                assert(context.prev === collection.prev[model.cid], 'ERROR: context.prev does not match');
            }
            if (model.cid === collection.last()) {
                assert(context.next === null, 'ERROR: context.next is not null');
            } else {
                assert(context.next === collection.next[model.cid], 'ERROR: context.next does not match');
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
    };

    // todo: maybe should be an object for model-context
    OutlineAction.prototype.prevVisibleNode = function (context) {
        var newRoot, li;
        newRoot = this.runtime.rNewRoot;
        if (context.prev == null) {
            // check if parent is visible
            li = null;
            if (context.parent != null) {
                li = this.getNodeView(context.parent, newRoot);
            }
            if (!li) {
                if (context.next == null) {
                    return null;
                }
                li = this.getNodeView(context.next, newRoot);
            }
        } else {
            li = this.getNodeView(context.prev, newRoot);
            if (!li) {
                console.log('ERROR: Missing prior view for focus');
                debugger;
            }
            li = li.getLastChild();
        }
        return li;
    };

    OutlineAction.prototype.getFocusNode = function () {
        if (this.focusFirst) {
            var newRoot, li, model, collection, rank, cursor;
            this.runtime.cursorstart = false;
            li = this.prevVisibleNode(this.runtime.rOldModelContext);
            if (!li) {
                return null;
            }
            if (li.value.cid === this.runtime.rOldModelContext.next) {
                this.runtime.cursorstart = true;
            }
            return li;
        } else {
            return _super.prototype.getFocusNode.call(this);
        }
    };

    OutlineAction.prototype.placeCursor = function (text) {
        if (this.cursorPosition != null) {
            if ($D.is_android) {
                text.setCursor(this.cursorPosition + 1);
            } else {
                text.setCursor(this.cursorPosition);
            }
        } else if (this.focusFirst) {
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
    };

    OutlineAction.prototype.contextStep = function () {
        this.getOldContext();
        this.getNewContext();
    };

    OutlineAction.prototype.newModel = function () {
        var activeModel = new OutlineNodeModel({
            text: this.options.text,
            children: null
        });
        this.options.activeID = activeModel.cid;
        return activeModel;
    };

    OutlineAction.prototype.getContextType = function (context, outline) {
        if (!context) {
            return 'none';
        }
        assert(context.parent != null, "context.parent is null");
        if (context.parent !== OutlineNodeModel.root.cid) {
            var parent = this.getNodeView(context.parent, outline.nodeRootView.id);
            if (parent != null) {
                if (parent.isCollapsed) {
                    return 'parentIsCollapsedLine';
                } else {
                    return 'parentIsExpandedLine';
                }
            } else {
                if (OutlineNodeModel.getById(context.parent).get('children') === View.get(outline.nodeRootView.id).value) {
                    return 'parentIsRoot';
                } else {
                    return 'parentInvisible';
                    // might be under collapsed item or outside it
                }
            }
        } else {
            if (View.get(outline.nodeRootView.id).value.get('parent') === OutlineNodeModel.root) {
                assert(outline.panelView.value === OutlineNodeModel.root, "Panelview is wrong");
                return 'parentIsRoot';
            } else {
                return 'parentInvisible';
            }
        }
    };

    OutlineAction.prototype.contextParentVisible = function (context, outline) {
        if (!context) {
            return null;
        }
        assert(context.parent != null, "context is null");
        var parent = this.getNodeView(context.parent, outline.nodeRootView.id);
        if (parent != null) {
            return parent.children;
        } else {
            if (OutlineNodeModel.getById(context.parent).get('children') === View.get(outline.nodeRootView.id).value) {
                return outline.nodeRootView;
            } else {
                return null;
            }
        }
    };

    OutlineAction.prototype.restoreContext = function () {
        var activeModel, collection, oldCollection;
        var that = this;
        this.addQueue('oldModelCollection', ['modelCreate'], function () {
            activeModel = OutlineNodeModel.getById(that.options.activeID);
            if (!activeModel) {
                activeModel = OutlineNodeModel.deletedById[that.options.activeID];
                activeModel.resurrect();
            }

            // check for resurrection
            if (activeModel.get('parent') != null) {
                oldCollection = activeModel.attributes.parent.attributes.children;
            } else {
                oldCollection = null;
            }
        });
        this.addQueue('oldModelRemove', ['oldModelCollection'], function () {
            // if parent-collection is empty, reset collapsed=false
            if (oldCollection != null) {
                if ((!that.options.undo) && (!that.options.redo) && (oldCollection.count === 1) && (!(that instanceof CollapseAction)) && (!that.options.origID)) {
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
        this.addQueue('newModelRank', ['oldModelRemove'], function () {
        });
        this.addQueue('newModelAdd', ['newModelRank'], function () {
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
                if (!that.options.copyID) {
                    assert(activeModel.attributes.children.count === 0, "Cannot delete node with children");
                }
                activeModel.delete();
            }
        });
    };

    OutlineAction.prototype.restoreViewContext = function (outline) {
        var that = this;
        assert(outline.id === outline.nodeRootView.id, "Invalid outline in restoreViewContext");
        var deps = ['newModelAdd', 'anim', 'focusFirst'];
        this.addQueue(['view', outline.id], deps, function () {
            var r = that.runtime, newModelContext, elem, newListView, createActiveLineView = false;
            newModelContext = r.rNewModelContext;

            // oldViewVisible, newViewVisible, oldParent, newParent, oldList, newList
            var activeNodeView = that.getNodeView(that.options.activeID, outline.id);

            // get parent listview; unless newModelContext is not in this view, then null
            newListView = that.contextParentVisible(newModelContext, outline);

            // console.log('Restoring "view" for outline ' + outline.id);
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
                if (activeNodeView == null) {
                    activeNodeView = new newListView.listItemTemplate({
                        parentView: newListView,
                        value: OutlineNodeModel.getById(that.options.activeID)
                    });
                    activeNodeView.render();
                } else {
                    // remove item from list in listItems
                    var oldListView = that.contextParentVisible(r.rOldModelContext, outline);
                    oldListView.detach(activeNodeView);
                    activeNodeView.changeParent(newListView);
                    activeNodeView.resize(); // adjust to parent's width
                }

                // insert in new location
                if (newModelContext.prev == null) {
                    newListView.insertAfter(null, activeNodeView);
                } else {
                    newListView.insertAfter(that.getNodeView(newModelContext.prev, outline.id), activeNodeView);
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

            // check if first node was added/removed, changing insertion-icon
            if (outline.value.count > 0) {
                outline.panelView.inserter.hide();
            } else {
                outline.panelView.inserter.show();
            }
        });
    };

    // utility functions
    OutlineAction.prototype.newListItemView = function (parentView) {
        // todo: update parentView.listItems
    };

    // must be called before placeholders inserted
    OutlineAction.prototype.getLineContext = function (view) {
        var type = 'next', r = this.runtime;
        var elem = $('#' + view.id);
        var oldspot = elem.next('li');
        if (oldspot.length === 0) {
            oldspot = elem.prev('li');
            type = 'prev';
        }
        if (oldspot.length > 0) {
            return { type: type, obj: View.get(oldspot.attr('id')) };
        } else {
            if (view.parentView.parentView && view.parentView.parentView instanceof NodeView) {
                return { type: 'parent', obj: view.parentView.parentView };
            } else {
                return { type: 'root', obj: View.get(view.nodeRootView.id) };
            }
        }
    };

    OutlineAction.prototype.getOldContext = function () {
        if (!this.options.activeID) {
            this.oldModelContext = null;
        } else {
            this.oldModelContext = OutlineNodeModel.getById(this.options.activeID).getContextAt();
        }
    };

    OutlineAction.prototype.execModel = function () {
        var that = this;
        this.addQueue('modelCreate', ['context'], function () {
            if (!that.options.activeID) {
                if (that.options.copyID) {
                    // todo: copy: create recursive copy of model (but links stay pointing to original)
                    var json = OutlineNodeModel.getById(that.options.copyID)._toJSON();
                    repossess(json);
                    var activeModel = new OutlineNodeModel();
                    activeModel.fromJSON(json);
                } else {
                    if (that.options.remoteID) {
                        var activeModel = new OutlineNodeModel({
                            cid: that.options.remoteID,
                            owner: that.options.userID,
                            text: that.options.text,
                            children: null
                        });
                    } else {
                        var activeModel = new OutlineNodeModel({
                            text: that.options.text,
                            children: null
                        });
                    }
                }
                that.options.activeID = activeModel.cid;
            }
        });
        this.restoreContext();
    };

    OutlineAction.prototype.execView = function (outline) {
        var that = this;
        this.restoreViewContext(outline);
    };

    OutlineAction.prototype.getNewContext = function () {
    };
    return OutlineAction;
})(AnimatedAction);
//# sourceMappingURL=OutlineAction.js.map
