///<reference path="Action.ts"/>
m_require("app/actions/Action.js");
class PanelCreateAction extends Action {
    type = "PanelCreate";
    prevPanel:string = null;
    newPanel:string = null;
    leftPanel:string;
    nextPanel:string;
    postLeftPanel:string;
    postRightPanel:string;
    // options:ActionOptions = {activeID: null, prevPanel: null, oldRoot: null, newRoot: 'new'};
    contextStep() { // save old context here
        var panels:LinkedList<PanelView> = View.getCurrentPage().content.grid.listItems;
        this.leftPanel = panels.first();
        this.nextPanel = panels.next[this.prevPanel];
    }

    validateOldContext() {
        var panels:LinkedList<PanelView> = View.getCurrentPage().content.grid.listItems;
        if (!this.options.undo) {
            if (this.leftPanel !== panels.first()) {
                console.log("ERROR: leftPanel is not what it should be before op");
                debugger;
            }
            if (panels.next[this.prevPanel] !== this.nextPanel) {
                console.log("ERROR: leftPanel is not before nextPanel before op");
                debugger;
            }
            if (panels.next[this.newPanel] !== undefined) {
                console.log("ERROR: new panel is not undefined before op");
                debugger;
            }
        } else {
            if (this.postLeftPanel !== panels.first()) {
                console.log("ERROR: leftPanel is not what it should be before undo");
                debugger;
            }
        }
    }

    validateNewContext() {
        var panels:LinkedList<PanelView> = View.getCurrentPage().content.grid.listItems;
        if (!this.postLeftPanel) {this.postLeftPanel = panels.first();}
        if (this.options.undo) {
            if (this.leftPanel !== panels.first()) {
                console.log("ERROR: leftPanel is not what it should be after undo");
                debugger;
            }
            if (panels.next[this.prevPanel] !== this.nextPanel) {
                console.log("ERROR: leftPanel is not before nextPanel after undo");
                debugger;
            }
            if (panels.next[this.newPanel] !== undefined) {
                console.log("ERROR: new panel is not undefined after undo");
                debugger;
            }
        } else {
            if (this.postLeftPanel !== panels.first()) {
                console.log("ERROR: leftPanel is not what it should be after op");
                debugger;
            }
        }
    }

    validateOptions() {
        // todo: fixup these validations
        var o:ActionOptions = this.options;
        var panels:LinkedList<PanelView> = View.getCurrentPage().content.grid.listItems;
        if (!o.redo && !o.undo) {
            this.leftPanel = panels.first();
        }
        if (o.undo) {}
        if (o.redo) {
            if (this.leftPanel !== panels.first()) {
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

    /*
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

     */
    execModel() {
        var that = this;
        this.addQueue('newModelAdd', ['context'], function() {
            var grid:PanelGridView = View.getCurrentPage().content.grid;
            var o:ActionOptions = that.options;
            var dir;
            if (o.undo) {
                dir = grid.remove(<PanelView>View.get(that.newPanel));
            } else {
                if (!that.newPanel) { // if id isn't chosen yet
                    that.newPanel = View.getNextId();
                }
                new PanelView({
                        id: that.newPanel, // possibly a resurrected id
                        parentView: View.currentPage.content.grid,
                        value: OutlineNodeModel.getById(that.options.activeID)
                });

                // eliminate drag-handle class left over from DragHandler
                var node = that.getNodeView(that.options.activeID, that.options.oldRoot);
                if (node) {
                    node.removeClass('drag-hidden');
                }

                // View.get(that.newPanel).removeClass('drag-hidden');
                dir = grid.insertAfter(<PanelView>View.get(that.options.prevPanel), <PanelView>View.get(that.newPanel));
                // we only wanted newPanel for the PanelManager id, not the ViewManager.
            }
            // move this to grid.renderUpdate(); ??
            // Define panelid's and rootid's for redraw
            // loop forwards or backwards - to avoid creating duplicate id's
            //  before we delete the original.
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
            var r = that.runtime;
        });
    }
}
