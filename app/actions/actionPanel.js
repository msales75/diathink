
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
                var c = ActionManager;
                if (c.actions.at(c.lastAction) !== that) {
                    console.log('ERROR: lastAction is not this');
                    debugger;
                }
                var prevAction = c.actions.at(c.lastAction-1);
                if ((prevAction.type==='CollapseAction')&&
                    (prevAction.options.activeID === that.options.activeID)) {

                    var activeModel= that.getModel(that.options.activeID);
                    activeModel.set('collapsed', prevAction.oldCollapsed);
                    for (var o in OutlineManager.outlines) {
                        OutlineManager.outlines[o].setData(
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
        this.addQueue(['view', outline.nodeRootView.id], ['newModelAdd'], function() {
            var model=null;
            if (that.options.undo) {
                if (outline.nodeRootView.id === that.options.newRoot) {
                    model = that.oldRootModel;
                    var view = View.get(that.options.newRoot).parentView
                        .parentView.changeRoot(model, that.options.oldRoot);
                    if (view !== that.options.oldRoot) {
                        console.log('Invalid return from changeRoot');
                        debugger;
                    }
                }
            } else {
                if (outline.nodeRootView.id === that.options.oldRoot) {
                    model = that.getModel(that.options.activeID);
                    if (that.options.redo) {
                        var view = View.get(that.options.oldRoot).parentView
                            .parentView.changeRoot(model, that.options.newRoot);
                        if (view !== that.options.newRoot) {
                            console.log('Invalid return from changeRoot');
                            debugger;
                        }
                    } else {
                        that.oldRootModel = View.get(that.options.oldRoot).rootModel;
                        that.options.newRoot = View.get(that.options.oldRoot).parentView
                            .parentView.changeRoot(model);
                    }
                }
            }
            // that.runtime.status.linePlaceAnim[outline.nodeRootView.id] = 2;
        });
    }
});

$D.PanelAction=$D.Action.extend({
    type: "PanelCreate",
    prevPanel: null,
    newPanel: null,
    options: {activeID: null, prevPanel: null, oldroot: null, newRoot: 'new'},
    contextStep: function() { // save old context here
        this.leftPanel = PanelManager.leftPanel;
        this.nextPanel = PanelManager.nextpanel[this.prevPanel];
    },
    validateOldContext: function() {
        if (!this.options.undo) {
            if (this.leftPanel !== PanelManager.leftPanel) {
                console.log("ERROR: leftPanel is not what it should be before op");
                debugger;
            }
            if (PanelManager.nextpanel[this.prevPanel] !==this.nextPanel) {
                console.log("ERROR: leftPanel is not before nextPanel before op");
                debugger;
            }
            if (PanelManager.nextpanel[this.newPanel] !== undefined) {
                console.log("ERROR: new panel is not undefined before op");
                debugger;
            }
        } else {
            if (this.postLeftPanel !== PanelManager.leftPanel) {
                console.log("ERROR: leftPanel is not what it should be before undo");
                debugger;
            }
        }
    },
    validateNewContext: function() {
        if (!this.postLeftPanel) {this.postLeftPanel = PanelManager.leftPanel;}
        if (this.options.undo) {
            if (this.leftPanel !== PanelManager.leftPanel) {
                console.log("ERROR: leftPanel is not what it should be after undo");
                debugger;
            }
            if (PanelManager.nextpanel[this.prevPanel] !==this.nextPanel) {
                console.log("ERROR: leftPanel is not before nextPanel after undo");
                debugger;
            }
            if (PanelManager.nextpanel[this.newPanel] !== undefined) {
                console.log("ERROR: new panel is not undefined after undo");
                debugger;
            }
        } else {
            if (this.postLeftPanel !== PanelManager.leftPanel) {
                console.log("ERROR: leftPanel is not what it should be after op");
                debugger;
            }
        }
    },
    validateOptions: function() {
        // todo: check leftPanel
        var PM = PanelManager;
        var o = this.options;
        if (!o.redo && !o.undo) {
            this.leftPanel = PM.leftPanel;
        }
        if (o.undo) {}
        if (o.redo) {
            if (this.leftPanel !== PM.leftPanel) {
                console.log("leftPanel doesn't match");
                debugger;
            }
        }

        // activeID
        // oldRoot
        // prevPanel
        // store: newPanel, newRoot
        // root = View.get(panelid).outline.alist.id
    },
    redrawPanel: function(n, p, firsttime) {
        // should changeRoot it instead?
        var c;
        var PM = PanelManager;
        var grid = View.getCurrentPage().content.grid;
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
        grid['scroll'+String(n)] = new PanelView({
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
        var grid = View.getCurrentPage().content.grid;
        grid['scroll'+String(n)].destroy();
        grid['scroll'+String(n)] = null;
    },
    execModel: function() {
        var that = this;
        this.addQueue('newModelAdd', ['context'], function() {
            var PM = PanelManager;
            var grid = View.getCurrentPage().content.grid;
            var o = that.options;
            var dir;
            if (o.undo) {
                dir = PM.remove(that.newPanel);
            } else {
                if (!that.newPanel) { // if id isn't chosen yet
                    that.newPanel = View.getNextId();
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
        this.addQueue(['view', outline.nodeRootView.id], ['newModelAdd', 'anim'], function() {
            var r= that.runtime;
        });
    }
});

$D.SlideAction = $D.Action.extend({
    type:'PanelSlide',
    oldLeftPanel:null,
    options: {direction:null},
    execModel: function() {
        var that = this;
        this.addQueue('newModelAdd', ['context'], function() {
            var PM = PanelManager;
            var grid = View.getCurrentPage().content.grid;
            var o = that.options;
            var dir;
            if (o.direction==='right') {
                if (o.undo) {
                    dir = 'left';
                } else {
                    dir = 'right';
                }
            } else if (o.direction==='left') {
                if (o.undo) {
                    dir = 'right';
                } else {
                    dir = 'left';
                }
            }
            if (dir==='right') {
                PM.leftPanel = PM.prevpanel[PM.leftPanel];
                $D.redrawPanels('right');
            } else if (dir==='left') {
                PM.leftPanel = PM.nextpanel[PM.leftPanel];
                $D.redrawPanels('left');
            }
            $D.updatePanelButtons();
        });

    },
    execView: function(outline) {
        var that = this;
        this.addQueue(['view', outline.nodeRootView.id], ['newModelAdd', 'anim'], function() {
            var r= that.runtime;
        });
    }
});