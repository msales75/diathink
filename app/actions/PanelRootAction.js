///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/actions/Action.js");

var PanelRootAction = (function (_super) {
    __extends(PanelRootAction, _super);
    function PanelRootAction() {
        _super.apply(this, arguments);
        this.type = "PanelRootAction";
        this.newType = 'panel';
        this.options = { activeID: null, collapsed: false };
        this._validateOptions = {
            requireActive: false,
            requireReference: false,
            requireOld: false,
            requireNew: false
        };
    }
    PanelRootAction.prototype.execModel = function () {
        var that = this;
        that.addQueue('newModelAdd', ['context'], function () {
            if ((!that.options.undo) && (!that.options.redo)) {
                var c = ActionManager;
                if (c.actions.at(c.lastAction) !== that) {
                    console.log('ERROR: lastAction is not this');
                    debugger;
                }
                var prevAction = c.actions.at(c.lastAction - 1);
                if ((prevAction.type === 'CollapseAction') && (prevAction.options.activeID === that.options.activeID)) {
                    var activeModel = that.getModel(that.options.activeID);
                    activeModel.set('collapsed', prevAction.oldCollapsed);
                    for (var o in OutlineManager.outlines) {
                        OutlineManager.outlines[o].setData(that.options.activeID, prevAction.oldViewCollapsed[o]);
                    }
                    prevAction.undone = true;
                    prevAction.lost = true;
                }
            }
            // todo: save current perspective into model?
        });
    };
    PanelRootAction.prototype.execView = function (outline) {
        var that = this;
        this.addQueue(['view', outline.nodeRootView.id], ['newModelAdd'], function () {
            var model = null;
            if (that.options.undo) {
                if (outline.nodeRootView.id === that.options.newRoot) {
                    model = that.oldRootModel;
                    var view = View.get(that.options.newRoot).parentView.parentView.changeRoot(model, that.options.oldRoot);
                    if (view !== that.options.oldRoot) {
                        console.log('Invalid return from changeRoot');
                        debugger;
                    }
                }
            } else {
                if (outline.nodeRootView.id === that.options.oldRoot) {
                    model = that.getModel(that.options.activeID);
                    if (that.options.redo) {
                        var view = View.get(that.options.oldRoot).parentView.parentView.changeRoot(model, that.options.newRoot);
                        if (view !== that.options.newRoot) {
                            console.log('Invalid return from changeRoot');
                            debugger;
                        }
                    } else {
                        that.oldRootModel = View.get(that.options.oldRoot).rootModel;
                        that.options.newRoot = View.get(that.options.oldRoot).parentView.parentView.changeRoot(model);
                    }
                }
            }
            // that.runtime.status.linePlaceAnim[outline.nodeRootView.id] = 2;
        });
    };
    return PanelRootAction;
})(Action);
//# sourceMappingURL=PanelRootAction.js.map
