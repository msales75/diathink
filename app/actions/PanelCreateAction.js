///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/actions/Action.js");

var PanelCreateAction = (function (_super) {
    __extends(PanelCreateAction, _super);
    function PanelCreateAction() {
        _super.apply(this, arguments);
        this.type = "PanelCreate";
        this.prevPanel = null;
        this.newPanel = null;
        this.options = { activeID: null, prevPanel: null, oldroot: null, newRoot: 'new' };
    }
    PanelCreateAction.prototype.contextStep = function () {
        this.leftPanel = PanelManager.leftPanel;
        this.nextPanel = PanelManager.nextpanel[this.prevPanel];
    };
    PanelCreateAction.prototype.validateOldContext = function () {
        if (!this.options.undo) {
            if (this.leftPanel !== PanelManager.leftPanel) {
                console.log("ERROR: leftPanel is not what it should be before op");
                debugger;
            }
            if (PanelManager.nextpanel[this.prevPanel] !== this.nextPanel) {
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
    };
    PanelCreateAction.prototype.validateNewContext = function () {
        if (!this.postLeftPanel) {
            this.postLeftPanel = PanelManager.leftPanel;
        }
        if (this.options.undo) {
            if (this.leftPanel !== PanelManager.leftPanel) {
                console.log("ERROR: leftPanel is not what it should be after undo");
                debugger;
            }
            if (PanelManager.nextpanel[this.prevPanel] !== this.nextPanel) {
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
    };
    PanelCreateAction.prototype.validateOptions = function () {
        // todo: check leftPanel
        var PM = PanelManager;
        var o = this.options;
        if (!o.redo && !o.undo) {
            this.leftPanel = PM.leftPanel;
        }
        if (o.undo) {
        }
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
    };
    PanelCreateAction.prototype.redrawPanel = function (n, p, firsttime) {
        // should changeRoot it instead?
        var c;
        var PM = PanelManager;
        var grid = View.getCurrentPage().content.grid;
        if (grid['scroll' + String(n)]) {
            c = grid['scroll' + String(n)].destroy(); // save context for this

            // panel destroy() respects outline graveyard.
            grid['scroll' + String(n)] = null;
        } else {
            c = {
                prev: null,
                next: null,
                parent: $('#' + grid.id).children().get(n - 1)
            };
        }

        // TODO: What if c doesn't exist if the panel was already destroyed
        // create a new panel with right id, but wrong alist & breadcrumbs.
        grid['scroll' + String(n)] = new PanelView({
            id: p,
            parentView: grid,
            rootModel: null
        });
        grid['scroll' + String(n)].renderAt(c);

        // grid['scroll'+String(n)].theme();
        // grid['scroll'+String(n)].registerEvents();
        if (firsttime && (grid['scroll' + String(n)].id === this.newPanel)) {
            grid['scroll' + String(n)].changeRoot(this.getModel(this.options.activeID));
        } else {
            grid['scroll' + String(n)].changeRoot(PM.rootModels[p], PM.rootViews[p]);
        }
    };
    PanelCreateAction.prototype.removePanel = function (n) {
        var grid = View.getCurrentPage().content.grid;
        grid['scroll' + String(n)].destroy();
        grid['scroll' + String(n)] = null;
    };
    PanelCreateAction.prototype.execModel = function () {
        var that = this;
        this.addQueue('newModelAdd', ['context'], function () {
            var PM = PanelManager;
            var grid = View.getCurrentPage().content.grid;
            var o = that.options;
            var dir;
            if (o.undo) {
                dir = PM.remove(that.newPanel);
            } else {
                if (!that.newPanel) {
                    that.newPanel = View.getNextId();
                }
                dir = PM.insertAfter(that.newPanel, that.options.prevPanel);
                // we only wanted newPanel for the PanelManager id, not the ViewManager.
            }
            PM.updateRoots();

            for (var p = PM.leftPanel, n = 1; (p !== '') && (n <= PM.panelsPerScreen); ++n, p = PM.nextpanel[p]) {
                if (dir === 'right') {
                    that.redrawPanel(n, p, !o.undo && !o.redo);
                }
            }
            var n2 = n;
            for (; n2 <= PM.panelsPerScreen; ++n2) {
                that.removePanel(n2);
            }
            if (dir === 'left') {
                --n;
                p = PM.prevpanel[p];
                for (; (p !== '') && (n >= 1); --n, p = PM.prevpanel[p]) {
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
