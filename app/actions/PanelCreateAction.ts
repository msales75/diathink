///<reference path="Action.ts"/>
m_require("app/actions/AnimatedAction.js");
class PanelCreateAction extends AnimatedAction {
    type = "PanelCreate";
    newPanel:string = null;
    clipDir:string;
    leftPanel:string;
    nextPanel:string;
    postLeftPanel:string;
    emptySlot:boolean;
    // options:ActionOptions = {activeID: null, prevPanel: null, oldRoot: null, newRoot: 'new'};
    runinit2() {
        var o:ActionOptions = this.options,
            r:RuntimeOptions = this.runtime;
        var grid:PanelGridView = View.getCurrentPage().content.gridwrapper.grid;
        var reverse:boolean = ((this.options.undo && !this.options.delete) ||
            (!this.options.undo && this.options.delete));
        if (this.options.delete && !this.options.undo && !this.options.redo) {
            this.newPanel = this.options.panelID;
            this.options.prevPanel = grid.listItems.prev[this.newPanel];
            this.options.isSubpanel = ((<PanelView>View.get(this.newPanel)).parentPanel != null);
        }
        var clipDir = this.clipDir;
        if (reverse) { // for deleting, fill-from-right iff there is something to the right
            this.emptySlot = (grid.value.last() === grid.listItems.last());
        } else {
            this.emptySlot = (grid.listItems.count < grid.numCols);
        }
        console.log("runinit2: Starting with clipDir="+clipDir+", emptySlot="+this.emptySlot);
        if ((clipDir==='right')&&(this.emptySlot)) {clipDir='none';}
        if ((clipDir==='none')&&(!this.emptySlot)) {clipDir='right';}
        console.log("Used emptySlot to temporarily update clipDir="+clipDir);
        if (reverse) {
            if (View.viewList[this.newPanel]) {
                this.usePostAnim = true;
                if (!this.options.speed) {this.options.speed = 80;} // was 60
                this.dropSource = new PanelDropSource({ // fade-out before slide
                    panelID: this.newPanel,
                    useFade: true,
                    fillDir: clipDir
                });
            }
        } else {
            this.usePostAnim = false;
            if (!this.options.speed) {this.options.speed = 120;} // was 100
            if (this.options.oldRoot && View.get(this.options.oldRoot)) { // if creation/deletion is tied to another panel
                this.dropSource = new NodeDropSource({
                    activeID: this.options.activeID,
                    outlineID: this.options.oldRoot,
                    dockView: this.options.dockView,
                    useDock: true,
                    dockTextOnly: true,
                    usePlaceholder: false
                });
            }
            if ((this.options.prevPanel === '') || View.get(this.options.prevPanel)) { // if previous panel is visible
                var grid:PanelGridView = View.currentPage.content.gridwrapper.grid;
                var offset:number = 0;
                if ((clipDir === 'none') && (grid.listItems.next[this.options.prevPanel] === '')) {
                    offset = grid.itemWidth;
                }
                this.dropTarget = new PanelDropTarget({ // no fade, just slide
                    activeID: this.options.activeID,
                    panelID: View.currentPage.content.gridwrapper.grid.getInsertLocation(this.options.prevPanel),
                    panelOffset: offset,
                    prevPanel: this.options.prevPanel,
                    clipDir: clipDir,
                    usePlaceholder: true
                });
            }
        }
    }

    contextStep() { // save old context here
        var grid:PanelGridView = View.getCurrentPage().content.gridwrapper.grid;
        var panels:LinkedList<PanelView> =
            View.getCurrentPage().content.gridwrapper.grid.listItems;
        var panelv:LinkedList<boolean> =
            View.getCurrentPage().content.gridwrapper.grid.value;
        this.leftPanel = panels.first();
        this.nextPanel = panelv.next[this.options.prevPanel];
        if (this.options.delete) { // panel deletion
            if ((grid.value.last() === grid.listItems.last()&&(grid.value.first()===grid.listItems.first()))) {
                this.clipDir = 'none';
            } else {
                if ((panels.first() !== grid.value.first()) && (panels.last() === grid.value.last())) {
                    // if right is empty and left is not
                    console.log("In panel deletion: setting clipDir=left because panels.first="+panels.first()+" and value.first="+grid.value.first());
                    this.clipDir = 'left';
                } else {
                    this.clipDir = 'right';
                }
            }
        } else { // panel insertion
            if (grid.listItems.count < grid.numCols) {
                this.clipDir = 'none';
            } else {
                if (this.options.prevPanel === panels.last()) {
                    // don't clip the panel that was just added
                    this.clipDir = 'left';
                } else {
                    this.clipDir = 'right';
                }
            }
        }
        console.log("contextStep, setting clipDir="+this.clipDir);
    }

    validateOldContext() {
        var panels:LinkedList<PanelView> = View.getCurrentPage().content.gridwrapper.grid.listItems;
        var panelv:LinkedList<boolean> = View.currentPage.content.gridwrapper.grid.value;
        var reverse:boolean = ((this.options.undo && !this.options.delete) ||
            (!this.options.undo && this.options.delete));
        if (!this.options.undo) {
            if (this.leftPanel !== panels.first()) {
                console.log("ERROR: leftPanel is not what it should be before op");
                debugger;
            }
            if (!this.options.delete) {
                if (panelv.next[this.options.prevPanel] !== this.nextPanel) {
                    console.log("ERROR: leftPanel is not before nextPanel before op");
                    debugger;
                }
                if (panelv.next[this.newPanel] !== undefined) {
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
        var panelv:LinkedList<boolean> = View.currentPage.content.gridwrapper.grid.value;
        if (!this.postLeftPanel) {this.postLeftPanel = panels.first();}
        var reverse:boolean = ((this.options.undo && !this.options.delete) ||
            (!this.options.undo && this.options.delete));
        if (this.options.undo) {
            if (this.leftPanel !== panels.first()) {
                console.log("ERROR: leftPanel is not what it should be after undo");
                debugger;
            }
            if (!this.options.delete) {
                if (panelv.next[this.options.prevPanel] !== this.nextPanel) {
                    console.log("ERROR: leftPanel is not before nextPanel after undo");
                    debugger;
                }
                if (panelv.next[this.newPanel] !== undefined) {
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
        this.addQueue(['uniqueView'], [
            ['anim']
        ], function() {
            var grid:PanelGridView = View.getCurrentPage().content.gridwrapper.grid;
            var o:ActionOptions = that.options;
            var dir;
            var clipDir = that.clipDir;
            if ((clipDir==='right')&&(that.emptySlot)) {clipDir='none';}
            if ((clipDir==='none')&&(!that.emptySlot)) {clipDir='right';}
            console.log("In execUniqueView, using original clipDir="+that.clipDir+", emptySlot="+that.emptySlot);
            console.log("Setting temporary clipDir = "+clipDir);

            var reverse:boolean = ((o.undo && !o.delete) ||
                (!o.undo && o.delete));
            if (reverse) {
                if (View.get(that.newPanel) == null) { // delete panel off-screen
                    grid.value.remove(that.newPanel);
                    if (clipDir==='left') { // todo: we need to slide screen to fill-left and clip-right
                        console.log("Showing prevleft and clipping right for invisible change");
                        grid.showPrevLeft();
                        grid.clipPanel('right');
                    }
                } else {
                    grid.fillPanel(clipDir, true); // shows next panel to the right if there is one, else shows next from left
                    // TODO: if you must fill on left, then everything is offset to the right now.
                    if ((!that.options.undo)&&(!that.options.redo)&&(clipDir==='left')) {
                        // we need to fix prevPanel based on the one we just slid in.
                        that.options.prevPanel = grid.value.prev[that.newPanel];
                    }
                    // give insertion location to dropSource for animation
                    if (that.dropSource) {
                        var nextLeft:number = null;
                        var nextView = <PanelView>View.get(View.currentPage.content.gridwrapper.grid.listItems.next[that.newPanel]);
                        if (nextView != null) {
                            nextLeft = nextView.layout.left;
                        }
                        (<PanelDropSource>that.dropSource).nextView = nextView;
                        (<PanelDropSource>that.dropSource).nextLeft = nextLeft;
                    }
                    View.get(that.newPanel).destroy(); // removes panel, without changing positions
                    grid.value.remove(that.newPanel);
                    if ((clipDir === 'none') && (grid.listItems.next[that.options.prevPanel] === '')) {
                        grid.clipPanel('none');
                    }
                }
                grid.updatePanelButtons();
            } else {
                if (((that.options.prevPanel !== '') && (View.get(that.options.prevPanel) == null)) ||
                    ((grid.listItems.next[that.options.prevPanel] === '') && (grid.listItems.count >= grid.numCols) &&
                        (that.clipDir !== 'left'))) {
                    // create panel off-screen
                    console.log("Creating panel off-screen");
                    grid.value.insertAfter(that.newPanel, true, that.options.prevPanel);
                    if (clipDir==='left') {
                        console.log("Showing nextRight and clipping left for invisible change");
                        grid.showNextRight();
                        grid.clipPanel('left');
                    }
                } else {
                    if (!that.newPanel) { // if id isn't chosen yet
                        that.newPanel = View.getNextId();
                    }
                    var parentPanel:PanelView = null;
                    if (o.isSubpanel) {
                        parentPanel = <PanelView>View.get(o.prevPanel);
                        // console.log("Setting parentPanel: "+parentPanel.id)
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
                    console.log("Inserting "+that.newPanel+" after previous panel "+that.options.prevPanel);
                    dir = grid.insertAfter(<PanelView>View.get(that.options.prevPanel), <PanelView>View.get(that.newPanel), 0);
                    console.log("Post-insertion clip = "+clipDir);
                    grid.clipPanel(clipDir); // remove extra panels
                }
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
