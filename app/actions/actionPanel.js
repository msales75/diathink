
m_require("app/actions/actionBase.js");

$D.RootAction= $D.Action.extend({
    type:"RootAction",
    newType: 'panel',
    options: {activeID: null, collapsed: false},
    _validateOptions: {
        requireActive: false,
        requireReference: false,
        requireOld: false,
        requireNew: false
    },
    execModel: function () {
        var that = this;
        that.addQueue('newModelAdd', ['context'], function() {
            if ((!that.options.undo) && (!that.options.redo)) {
                var c = $D.ActionManager;
                if (c.actions.at(c.lastAction) !== that) {
                    console.log('ERROR: lastAction is not this');
                    debugger;
                }
                var prevAction = c.actions.at(c.lastAction-1);
                if ((prevAction.type==='CollapseAction')&&
                    (prevAction.options.activeID === that.options.activeID)) {

                    var activeModel= that.getModel(that.options.activeID);
                    activeModel.set('collapsed', prevAction.oldCollapsed);
                    for (var o in $D.OutlineManager.outlines) {
                        $D.OutlineManager.outlines[o].setData(
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

$D.PanelAction=$D.Action.extend({
    type: "PanelCreate",
    prevPanel: null,
    newPanel: null,
    options: {activeID: null, prevPanel: null, oldroot: null, newRoot: 'new'},
    runinit2: function() {
    },
    validateOptions: function() {
        // activeID
        // oldRoot
        // prevPanel
        // store: newPanel, newRoot
        // root = M.ViewManager.getViewById(panelid).outline.alist.id
    },
    redrawPanel: function(n, p, firsttime) {
        // should changeRoot it instead?
        var c;
        var PM = $D.PanelManager;
        var grid = M.ViewManager.getCurrentPage().content.grid;
        if (grid['scroll'+String(n)]) {
            c = grid['scroll'+String(n)].destroy(); // save context for this
            // panel destroy() respects outline graveyard.
            grid['scroll'+String(n)] = null;
        } else {
            c = {
                prev: null,
                next: null,
                parent: $('#'+grid.id).children().get(n-1)
            };
        }

        // TODO: What if c doesn't exist if the panel was already destroyed

        // create a new panel with right id, but wrong alist & breadcrumbs.
        grid['scroll'+String(n)] = new $D.PanelOutlineView({
            id: p,
            parentView: grid,
            rootModel: null
        });
        grid['scroll'+String(n)].renderAt(c);

        // grid['scroll'+String(n)].theme();
        // grid['scroll'+String(n)].registerEvents();
        if (firsttime && (grid['scroll'+String(n)].id === this.newPanel)) {
            grid['scroll'+String(n)].changeRoot(
                this.getModel(this.options.activeID)
            );
        } else {
            grid['scroll'+String(n)].changeRoot(
                PM.rootModels[p],
                PM.rootViews[p]
            );
        }
    },
    removePanel: function(n) {
        var grid = M.ViewManager.getCurrentPage().content.grid;
        grid['scroll'+String(n)].destroy();
        grid['scroll'+String(n)] = null;
    },
    execModel: function() {
        var that = this;
        this.addQueue('newModelAdd', ['context'], function() {
            var PM = $D.PanelManager;
            var grid = M.ViewManager.getCurrentPage().content.grid;
            var o = that.options;
            var dir;
            if (o.undo) {
                dir = PM.remove(that.newPanel);
            } else {
                if (!that.newPanel) { // if id isn't chosen yet
                    var newPanel = new $D.PanelOutlineView({
                        rootModel: that.getModel(that.options.activeID)
                    });
                    that.newPanel = newPanel.id;
                    newPanel.destroy(); // remove from viewmanager - this is counter-intuitive,
                }
                dir = PM.insertAfter(that.newPanel, that.options.prevPanel);
                // we only wanted newPanel for the PanelManager id, not the ViewManager.
            }
            PM.updateRoots();

            // move this to grid.renderUpdate(); ??
            // Define panelid's and rootid's for redraw

            // loop forwards or backwards - to avoid creating duplicate id's
            //  before we delete the original.

            for (var p = PM.leftPanel, n=1;
                 (p!=='') && (n<=PM.panelsPerScreen);
                 ++n, p=PM.nextpanel[p]) {
                if (dir==='right') {
                    that.redrawPanel(n, p, !o.undo && !o.redo);
                }
            }
            var n2 = n;
            for ( ; n2<=PM.panelsPerScreen; ++n2) {
                that.removePanel(n2);
            }
            if (dir==='left') {
                --n; p=PM.prevpanel[p];
                for ( ;
                     (p!=='') && (n>=1);
                     --n, p=PM.prevpanel[p]) {
                    that.redrawPanel(n, p, !o.undo && !o.redo);
                }
            }

            PM.updateRoots();
            $D.updatePanelButtons();

            if (that.options.dockElem) {
                $(document.body).removeClass('transition-mode');
                that.options.dockElem.parentNode.removeChild(that.options.dockElem);
                that.options.dockElem = undefined;
            }
        });
    },
    execView: function(outline) { // mutually exclusive with restoreViewContext
        var that = this;
        this.addQueue(['view', outline.rootID], ['newModelAdd', 'anim'], function() {
            var r= that.runtime;
        });
    }
});
