///<reference path="Action.ts"/>

m_require("app/actions/Action.js");



class PanelRootAction extends Action {
    type="PanelRootAction";
    newType= 'panel';
    // options:ActionOptions= {activeID: null, collapsed: false};
    oldRootModel:OutlineNodeModel;
    _validateOptions= {
        requireActive: false,
        requireReference: false,
        requireOld: false,
        requireNew: false
    };
    execModel() {
        var that = this;
        that.addQueue('newModelAdd', ['context'], function() {
            if ((!that.options.undo) && (!that.options.redo)) {
                var c:typeof ActionManager;
                c = ActionManager;
                if (c.actions.at(c.lastAction) !== that) {
                    console.log('ERROR: lastAction is not this');
                    debugger;
                }
                var prevAction:Action = <Action>c.actions.at(c.lastAction-1);
                if ((prevAction.type==='CollapseAction')&&
                    (prevAction.options.activeID === that.options.activeID)) {
                    var activeModel= that.getModel(that.options.activeID);
                    activeModel.set('collapsed', (<CollapseAction>prevAction).oldCollapsed);
                    for (var o in OutlineRootView.outlinesById) {
                        OutlineRootView.outlinesById[o].setData(
                            that.options.activeID,
                            (<CollapseAction>prevAction).oldViewCollapsed[o]);
                    }
                    prevAction.undone = true;
                    prevAction.lost = true;
                }
            }
            // todo: save current perspective into model?
        });
    }
    execView(outline) {
        var that:PanelRootAction = this;
        this.addQueue(['view', outline.nodeRootView.id], ['newModelAdd'], function() {
            var model:OutlineNodeModel=null;
            if (that.options.undo) {
                if (outline.nodeRootView.id === that.options.newRoot) {
                    model = that.oldRootModel;
                    var view = (<OutlineRootView>View.get(that.options.newRoot)).parentView
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
                        var view = (<OutlineRootView>View.get(that.options.oldRoot)).parentView
                            .parentView.changeRoot(model, that.options.newRoot);
                        if (view !== that.options.newRoot) {
                            console.log('Invalid return from changeRoot');
                            debugger;
                        }
                    } else {
                        that.oldRootModel = View.get(that.options.oldRoot).panelView.value;
                        that.options.newRoot = View.get(that.options.oldRoot).panelView.changeRoot(model, null);
                    }
                }
            }
            // that.runtime.status.linePlaceAnim[outline.nodeRootView.id] = 2;
        });
    }
}
