m_require("app/actions/actionBase.js");

$D.CollapseAction= $D.Action.extend({
    type:"CollapseAction",
    options: {activeID: null, collapsed: false},
    _validateOptions: {
        requireActive: true,
        requireReference: false,
        requireOld: true,
        requireNew: true
    },
    execModel: function () {
        var that = this;
        that.addQueue('newModelAdd', ['context'], function() {
            var collapsed;
            if (that.options.undo) {
                collapsed = that.oldCollapsed;
            } else {
                collapsed = that.options.collapsed;
            }
            var activeModel= that.getModel(that.options.activeID);
            if ((!that.options.undo) && (!that.options.redo)) {
                that.oldCollapsed = activeModel.get('collapsed');
                if (!that.oldCollapsed) {that.oldCollapsed = false;}
            }
            // console.log("Setting model "+that.options.activeID+" collapsed = "+collapsed);
            activeModel.set('collapsed', collapsed);
        });
    },
    execView:function (outline) {
        var that = this;
        this.addQueue(['view', outline.nodeRootView.id], ['newModelAdd'], function() {
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
            var activeLineView = that.getLineView(that.options.activeID, outline.nodeRootView.id);
            if (!activeLineView) {
                console.log("Action collapse="+collapsed+" has no activeLineView, with activeID="+
                    that.options.activeID+"; oldRoot="+outline.nodeRootView.id+
                    "; undo="+that.options.undo);
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
                    that.oldViewCollapsed[outline.nodeRootView.id] = outline.getData(that.options.activeID);
                }
                if ((that.options.oldRoot === outline.nodeRootView.id)||
                    (that.options.oldRoot==='all')) {
                    collapsed = that.options.collapsed;
                } else {
                    collapsed = $('#'+activeLineView.id).hasClass('collapsed');
                }
            }
            outline.setData(that.options.activeID, collapsed);

            if (collapsed == null) {
                if (!that.options.undo) {
                    console.log('ERROR collapsed is null not on undo'); debugger;
                }
                collapsed = activeModel.get('collapsed');
            }
            activeLineView.isCollapsed = collapsed; // is this needed?
            if (collapsed) {
                if (! $('#'+activeLineView.id).hasClass('collapsed')) {
                    $('#'+activeLineView.id).removeClass('expanded').addClass('collapsed');
                    activeLineView.children.collapseList();
                }
            } else {
                if ($('#'+activeLineView.id).hasClass('collapsed')) {
                    $('#'+activeLineView.id).addClass('expanded').removeClass('collapsed');
                    activeLineView.children.expandList();
                }
            }
            // satisfy additional dependencies that are never used in this actiontype
            // that.runtime.status.linePlaceAnim[outline.nodeRootView.id] = 2;
        });
    }
});
