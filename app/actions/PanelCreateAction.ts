///<reference path="Action.ts"/>

m_require("app/actions/Action.js");


class PanelCreateAction extends Action {
    type= "PanelCreate";
    prevPanel= null;
    newPanel:string = null;
    leftPanel:string;
    nextPanel:string;
    postLeftPanel:string;
    postRightPanel:string;
    // options:ActionOptions = {activeID: null, prevPanel: null, oldRoot: null, newRoot: 'new'};
    contextStep() { // save old context here
        this.leftPanel = PanelManager.leftPanel;
        this.nextPanel = PanelManager.nextpanel[this.prevPanel];
    }
    validateOldContext() {
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
    }
    validateNewContext() {
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
    }
    validateOptions() {
        // todo: check leftPanel
        var PM:typeof PanelManager;
        PM = PanelManager;
        var o:ActionOptions = this.options;
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
    }
    redrawPanel(n, p, firsttime) {
        // should changeRoot it instead?
        var c;
        var PM : typeof PanelManager;
        PM = PanelManager;
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
                this.getModel(this.options.activeID),
                null
            );
        } else {
            grid['scroll'+String(n)].changeRoot(
                PM.rootModels[p],
                PM.rootViews[p]
            );
        }
    }
    removePanel(n) {
        var grid = View.getCurrentPage().content.grid;
        grid['scroll'+String(n)].destroy();
        grid['scroll'+String(n)] = null;
    }
    execModel() {
        var that = this;
        this.addQueue('newModelAdd', ['context'], function() {
            var PM : typeof PanelManager;
            PM = PanelManager;
            var grid = View.getCurrentPage().content.grid;
            var o:ActionOptions = that.options;
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
    }
    execView(outline) { // mutually exclusive with restoreViewContext
        var that = this;
        this.addQueue(['view', outline.nodeRootView.id], ['newModelAdd', 'anim'], function() {
            var r= that.runtime;
        });
    }
}
