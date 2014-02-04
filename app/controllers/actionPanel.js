
diathink.RootAction= diathink.Action.extend({
    type:"RootAction",
    newType: 'panel',
    useOldLinePlaceholder: false,
    useNewLinePlaceholder: false,
    options: {activeID: null, collapsed: false},
    _validateOptions: {
        requireActive: false,
        requireReference: false,
        requireOld: false,
        requireNew: false
    },
    getNewContext: function() {
        this.newModelContext = this.oldModelContext;
    },
    getOldPanelContext: function() { // define oldPanelContext and newPanelContext
        var context = null;
        if (this.options.activePanel) {
            var panelid = this.options.activePanel;
            context = {};
            context.next = diathink.PanelManager.nextpanel[panelid];
            context.prev = diathink.PanelManager.prevpanel[panelid];
            context.root = M.ViewManager.getViewById(panelid).outline.alist.id;
        }
        this.oldPanelContext = context;
    },
    getNewPanelContext: function() {
        var context = null;
        if (this.options.activePanel) {
            var panelid = this.options.activePanel;
            context = {};
            context.next = diathink.PanelManager.nextpanel[panelid];
            context.prev = diathink.PanelManager.prevpanel[panelid];
            context.root = this.options.activeID;
        }
        this.newPanelContext = context;
    },
    preview: function() {
        // custom docking function for change-root

    },
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
                    activeModel.set('collapsed', prevAction.oldCollapsed);
                    for (var o in diathink.OutlineManager.outlines) {
                        diathink.OutlineManager.outlines[o].setData(
                            that.options.activeID,
                            prevAction.oldViewCollapsed[o]);
                    }
                    prevAction.undone = true;
                    prevAction.lost = true;
                }
            }
            // todo: save current perspective into model?
        });
    },
    execView:function (outline) {
        var that = this;
        this.addQueue(['view', outline.rootID], ['newModelAdd'], function() {
            var model=null;
            if (that.options.undo) {
                if (outline.rootID === that.options.newRoot) {
                    model = that.oldRootModel;
                    var view = M.ViewManager.getViewById(that.options.newRoot).parentView
                        .parentView.changeRoot(model, that.options.oldRoot);
                    if (view !== that.options.oldRoot) {
                        console.log('Invalid return from changeRoot');
                        debugger;
                    }
                }
            } else {
                if (outline.rootID === that.options.oldRoot) {
                    model = that.getModel(that.options.activeID);
                    if (that.options.redo) {
                        var view = M.ViewManager.getViewById(that.options.oldRoot).parentView
                            .parentView.changeRoot(model, that.options.newRoot);
                        if (view !== that.options.newRoot) {
                            console.log('Invalid return from changeRoot');
                            debugger;
                        }
                    } else {
                        that.oldRootModel = M.ViewManager.getViewById(that.options.oldRoot).rootModel;
                        that.options.newRoot = M.ViewManager.getViewById(that.options.oldRoot).parentView
                            .parentView.changeRoot(model);
                    }
                }
            }
            // that.runtime.status.linePlaceAnim[outline.rootID] = 2;
        });
    }
});

diathink.PanelAction=diathink.Action.extend({
    type: "PanelAction",
    newType: 'panel',
    useOldLinePlaceholder: false,
    useNewLinePlaceholder: false,
    options: {activeID: null, collapsed: false},
    _validateOptions: {
        requireActive: false,
        requireReference: false,
        requireOld: false,
        requireNew: false
    },
    runinit2: function() {
        // create flags for various operations
        // if we're moving a panel, creating a panel, collapsing a panel, changing root.
        r.rOldPanelContext = null;
        r.rNewPanelContext = null;
        if ((r.rOldType==='panel')||(r.rNewType==='panel')) {
            if (o.undo) {
                r.rOldPanelContext = this.newPanelContext;
                r.rNewPanelContext = this.oldPanelContext;
            } else {
                r.rOldPanelContext = this.oldPanelContext;
                r.rNewPanelContext = this.newPanelContext;
            }
        }
    },
    getNewContext: function() { // no changes to model
        this.newModelContext = this.oldModelContext;
    },
    getOldPanelContext: function() { // define oldPanelContext and newPanelContext
        this.oldPanelContext = null; // panel newly created
    },
    getNewPanelContext: function() {
        var context = null;
        if (this.options.activePanel) {
            var panelid = this.options.activePanel;
            context = {};
            context.next = diathink.PanelManager.nextpanel[panelid];
            context.prev = diathink.PanelManager.prevpanel[panelid];
            context.root = this.options.activeID;
        }
        this.newPanelContext = context;
    },
    restorePanelContext: function() { // mutually exclusive with restoreViewContext
        var that = this;
        this.addQueue(['view', outline.rootID], ['newModelAdd', 'anim'], function() {
            var r= that.runtime;
            var collection, rank, oldParent, oldParentView=null;
            var newModelContext, li, elem, oldspot, neighbor, neighborType,
                newParentView, createActiveLineView=false;
            if ((r.rNewType!=='panel')&&(r.rOldType!=='panel')) {
                console.log("restorePanelContext called with no panel-ops");
                debugger;
                return;
            }
            if ((r.rOldPanelContext==null)&&(r.rNewPanelContext==null)) {
                console.log('restorePanelContext called with no context');
                debugger;
                return;
            }
            if (r.rOldPanelContext == null) { // create panel

                diathink.PanelManager.insertAfter(newid, previousid);
            } else if (r.rNewPanelContext == null) { // destroy panel
                diathink.PanelManager.remove(r.rNewPanelContext);
            } else { // move panel
                // diathink.PanelManager.moveAfter();
            }
        });
    }
});
