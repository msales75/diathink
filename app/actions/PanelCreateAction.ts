///<reference path="Action.ts"/>
m_require("app/actions/AnimatedAction.js");
class PanelCreateAction extends AnimatedAction {
    type = "PanelCreate";
    newPanel:string = null;
    leftPanel:string;
    nextPanel:string;
    postLeftPanel:string;
    postRightPanel:string;
    // options:ActionOptions = {activeID: null, prevPanel: null, oldRoot: null, newRoot: 'new'};
    runinit2() {
        var o:ActionOptions = this.options,
            r:RuntimeOptions = this.runtime;
        var reverse:boolean = ((this.options.undo && !this.options.delete)||
                    (!this.options.undo && this.options.delete));

        if (this.options.delete && !this.options.undo && !this.options.redo) {
            this.newPanel = this.options.panelID;
            this.options.prevPanel = View.currentPage.content.gridwrapper.grid.listItems.prev[this.newPanel];
            this.options.isSubpanel = ((<PanelView>View.get(this.newPanel)).parentPanel!=null);
        }
        if (reverse) {
            this.usePostAnim = true;
            if (!this.options.speed) {this.options.speed = 60;}
            this.dropSource = new PanelDropSource({ // fade-out before slide
                panelID: this.newPanel,
                useFade: true
            });
        } else {
            this.usePostAnim = false;
            if (!this.options.speed) {this.options.speed = 100;}
            if (this.options.oldRoot) { // if creation/deletion is tied to another panel
                this.dropSource = new NodeDropSource({
                    activeID: this.options.activeID,
                    outlineID: this.options.oldRoot,
                    dockView: this.options.dockView,
                    useDock: true,
                    dockTextOnly: true,
                    usePlaceholder: false
                });
            }

            this.dropTarget = new PanelDropTarget({ // no fade, just slide
                activeID: this.options.activeID,
                panelID: View.currentPage.content.gridwrapper.grid.getInsertLocation(this.options.prevPanel),
                prevPanel: this.options.prevPanel,
                usePlaceholder: true
            });
        }
    }
    contextStep() { // save old context here
        var panels:LinkedList<PanelView> = View.getCurrentPage().content.gridwrapper.grid.listItems;
        this.leftPanel = panels.first();
        this.nextPanel = panels.next[this.options.prevPanel];
    }

    validateOldContext() {
        var panels:LinkedList<PanelView> = View.getCurrentPage().content.gridwrapper.grid.listItems;
        var reverse:boolean = ((this.options.undo && !this.options.delete)||
            (!this.options.undo && this.options.delete));
        if (!this.options.undo) {
            if (this.leftPanel !== panels.first()) {
                console.log("ERROR: leftPanel is not what it should be before op");
                debugger;
            }
            if (!this.options.delete) {
                if (panels.next[this.options.prevPanel] !== this.nextPanel) {
                    console.log("ERROR: leftPanel is not before nextPanel before op");
                    debugger;
                }
                if (panels.next[this.newPanel] !== undefined) {
                    console.log("ERROR: new panel is not undefined before op");
                    debugger;
                }
            }
        } else {
            if (this.postLeftPanel !== panels.first()) {
                console.log("ERROR: leftPanel is not what it should be before undo");
                debugger;
            }
        }
    }

    validateNewContext() {
        var panels:LinkedList<PanelView> = View.getCurrentPage().content.gridwrapper.grid.listItems;
        if (!this.postLeftPanel) {this.postLeftPanel = panels.first();}
        var reverse:boolean = ((this.options.undo && !this.options.delete)||
            (!this.options.undo && this.options.delete));
        if (this.options.undo) {
            if (this.leftPanel !== panels.first()) {
                console.log("ERROR: leftPanel is not what it should be after undo");
                debugger;
            }
            if (!this.options.delete) {
                if (panels.next[this.options.prevPanel] !== this.nextPanel) {
                    console.log("ERROR: leftPanel is not before nextPanel after undo");
                    debugger;
                }
                if (panels.next[this.newPanel] !== undefined) {
                    console.log("ERROR: new panel is not undefined after undo");
                    debugger;
                }
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
        var panels:LinkedList<PanelView> = View.getCurrentPage().content.gridwrapper.grid.listItems;
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
    execUniqueView() {
        var that = this;
        this.addQueue(['uniqueView'], [['anim']], function() {
            var grid:PanelGridView = View.getCurrentPage().content.gridwrapper.grid;
            var o:ActionOptions = that.options;
            var dir;
            var reverse:boolean = ((o.undo && !o.delete)||
                (!o.undo && o.delete));
            if (reverse) {
                grid.slideFill('left'); // appends incoming panel from the right
                // give insertion location to dropSource for animation
                if (that.dropSource) {
                    var nextLeft:number=null;
                    var nextView = <PanelView>View.get(View.currentPage.content.gridwrapper.grid.listItems.next[that.newPanel]);
                    if (nextView!=null) {
                        nextLeft = nextView.layout.left;
                    }
                    (<PanelDropSource>that.dropSource).nextView = nextView;
                    (<PanelDropSource>that.dropSource).nextLeft = nextLeft;
                }
                dir = View.get(that.newPanel).destroy(); // removes panel, without changing positions
                grid.value.remove(that.newPanel);
                grid.updatePanelButtons();
            } else {
                if (!that.newPanel) { // if id isn't chosen yet
                    that.newPanel = View.getNextId();
                }
                var parentPanel:PanelView = null;
                if (o.isSubpanel) {
                    parentPanel = <PanelView>View.get(o.prevPanel);
                    console.log("Setting parentPanel: "+parentPanel.id)
                }
                new PanelView({
                        id: that.newPanel, // possibly a resurrected id
                        parentView: View.currentPage.content.gridwrapper.grid,
                        parentPanel: parentPanel,
                        value: OutlineNodeModel.getById(that.options.activeID)
                });

                // eliminate drag-handle class left over from DragHandler
                if (that.options.oldRoot) {
                    var node = that.getNodeView(that.options.activeID, that.options.oldRoot);
                    if (node) {
                        node.removeClass('drag-hidden');
                    }
                }
                // if the inserted node is right after the previous panel

                // View.get(that.newPanel).removeClass('drag-hidden');
                dir = grid.insertAfter(<PanelView>View.get(that.options.prevPanel), <PanelView>View.get(that.newPanel),0);
                grid.clip(dir); // remove extra panels
                grid.updatePanelButtons();
                // we only wanted newPanel for the PanelManager id, not the ViewManager.
            }
            // move this to grid.renderUpdate(); ??
            // Define panelid's and rootid's for redraw
            // loop forwards or backwards - to avoid creating duplicate id's
            //  before we delete the original.
            if (that.options.dockView) {
                $(document.body).removeClass('transition-mode');
                that.options.dockView.destroy();
                that.options.dockView = undefined;
            }
            // $(window).resize(); // fix height of new panel, spacer; a bit hacky
        });
    }
}
