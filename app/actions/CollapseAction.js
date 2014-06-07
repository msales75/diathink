var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="Action.ts"/>
m_require("app/actions/Action.js");

var CollapseAction = (function (_super) {
    __extends(CollapseAction, _super);
    function CollapseAction() {
        _super.apply(this, arguments);
        this.type = "CollapseAction";
        // options:ActionOptions = {activeID: null, collapsed: false};
        this._validateOptions = {
            requireActive: true,
            requireReference: false,
            requireOld: true,
            requireNew: true
        };
    }
    CollapseAction.prototype.execModel = function () {
        var that = this;
        that.addQueue('newModelAdd', ['context'], function () {
            var collapsed;
            if (that.options.undo) {
                collapsed = that.oldCollapsed;
            } else {
                collapsed = that.options.collapsed;
            }
            var activeModel = that.getModel(that.options.activeID);
            if ((!that.options.undo) && (!that.options.redo)) {
                that.oldCollapsed = activeModel.get('collapsed');
                if (!that.oldCollapsed) {
                    that.oldCollapsed = false;
                }
            }

            // console.log("Setting model "+that.options.activeID+" collapsed = "+collapsed);
            activeModel.set('collapsed', collapsed);
        });
    };
    CollapseAction.prototype.execView = function (outline) {
        var that = this;
        this.addQueue(['view', outline.nodeRootView.id], ['newModelAdd'], function () {
            // Each node starts with collapsed=null.
            // On expand/collapse, all visible nodes go to collapsed=true/false.
            // On undo, all nodes revert to prior-state of null/true/false.
            // On changeroot, any non-virgin contained-nodes remember their state.
            // On undoing changeroot, outline remembers former state for all nodes modified before changeroot.
            // Collapsed node similarly remember based on current outline-state.
            // Each expand/collapse migrates all visible matching-items to use
            //   their current view-specific settings.
            // If they previously used model settings, it's because they
            //   were never visible during a matching collapse.
            // Undoing the first expand/collapse should restore collapsed=null
            //   to the node, along with reverting the model-collapsed state.
            // Undoing future changes should record the change in view-status.
            //  between open/closed/null
            var activeModel = that.getModel(that.options.activeID);
            var activeLineView = that.getNodeView(that.options.activeID, outline.nodeRootView.id);
            if (!activeLineView) {
                //console.log("Action collapse="+collapsed+" has no activeLineView, with activeID="+
                //    that.options.activeID+"; oldRoot="+outline.nodeRootView.id+
                //    "; undo="+that.options.undo);
                // Action collapse=false has no activeLineView, with activeID=c14; oldRoot=m_16; undo=false
                // that.runtime.status.linePlaceAnim[outline.nodeRootView.id] = 2;
                return;
            }
            var collapsed;
            if (that.options.undo) {
                // oldCollapsed depends on view, can be true, false, or null.
                collapsed = that.oldViewCollapsed[outline.nodeRootView.id];
                // console.log("Undo retrieved collapsed = "+collapsed+" for view="+outline.nodeRootView.id);
            } else {
                if (!that.options.redo) {
                    that.oldViewCollapsed[outline.id] = outline.getData(that.options.activeID);
                    if (that.oldViewCollapsed[outline.id] == null) {
                        that.oldViewCollapsed[outline.id] = OutlineNodeModel.getById(that.options.activeID).attributes.collapsed;
                    }
                }
                if ((that.options.oldRoot === outline.nodeRootView.id) || (that.options.oldRoot === 'all')) {
                    collapsed = that.options.collapsed;
                } else {
                    collapsed = activeLineView.isCollapsed;
                }
            }
            outline.setData(that.options.activeID, collapsed);

            if (collapsed == null) {
                if (!that.options.undo) {
                    console.log('ERROR collapsed is null not on undo');
                    debugger;
                }
                collapsed = activeModel.get('collapsed');
            }
            activeLineView.setCollapsed(collapsed);
            // satisfy additional dependencies that are never used in this actiontype
            // that.runtime.status.linePlaceAnim[outline.nodeRootView.id] = 2;
        });
    };
    return CollapseAction;
})(Action);
//# sourceMappingURL=CollapseAction.js.map
