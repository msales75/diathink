var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="Action.ts"/>
m_require("app/actions/Action.js");
var PanelCreateAction = (function (_super) {
    __extends(PanelCreateAction, _super);
    function PanelCreateAction() {
        _super.apply(this, arguments);
        this.type = "PanelCreate";
        this.prevPanel = null;
        this.newPanel = null;
    }
    // options:ActionOptions = {activeID: null, prevPanel: null, oldRoot: null, newRoot: 'new'};
    PanelCreateAction.prototype.contextStep = function () {
        var panels = View.getCurrentPage().content.grid.listItems;
        this.leftPanel = panels.first();
        this.nextPanel = panels.next[this.prevPanel];
    };

    PanelCreateAction.prototype.validateOldContext = function () {
        var panels = View.getCurrentPage().content.grid.listItems;
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
    };

    PanelCreateAction.prototype.validateNewContext = function () {
        var panels = View.getCurrentPage().content.grid.listItems;
        if (!this.postLeftPanel) {
            this.postLeftPanel = panels.first();
        }
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
    };

    PanelCreateAction.prototype.validateOptions = function () {
        // todo: fixup these validations
        var o = this.options;
        var panels = View.getCurrentPage().content.grid.listItems;
        if (!o.redo && !o.undo) {
            this.leftPanel = panels.first();
        }
        if (o.undo) {
        }
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
    };

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
    PanelCreateAction.prototype.execModel = function () {
        var that = this;
        this.addQueue('newModelAdd', ['context'], function () {
            var grid = View.getCurrentPage().content.grid;
            var o = that.options;
            var dir;
            if (o.undo) {
                dir = View.get(that.newPanel).destroy();
            } else {
                if (!that.newPanel) {
                    that.newPanel = View.getNextId();
                }
                new PanelView({
                    id: that.newPanel,
                    parentView: View.currentPage.content.grid,
                    value: OutlineNodeModel.getById(that.options.activeID)
                });

                // eliminate drag-handle class left over from DragHandler
                var node = that.getNodeView(that.options.activeID, that.options.oldRoot);
                if (node) {
                    node.removeClass('drag-hidden');
                }

                // View.get(that.newPanel).removeClass('drag-hidden');
                dir = grid.insertAfter(View.get(that.options.prevPanel), View.get(that.newPanel));
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
    };

    PanelCreateAction.prototype.execView = function (outline) {
        var that = this;
        this.addQueue(['view', outline.nodeRootView.id], ['newModelAdd', 'anim'], function () {
            var r = that.runtime;
        });
    };
    return PanelCreateAction;
})(Action);
//# sourceMappingURL=PanelCreateAction.js.map