///<reference path="Action.ts"/>

m_require("app/actions/AnimatedAction.js");

class PanelRootAction extends AnimatedAction {
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
    runinit2() {
        var o:ActionOptions = this.options,
            r:RuntimeOptions = this.runtime;
        if (this.options.undo) {
            this.dropSource = new PanelDropSource({
                activeID: this.oldRootModel.cid,
                panelID: View.get(this.options.newRoot).panelView.id
            });
            this.dropTarget = new NodeDropTarget({
                activeID:this.options.activeID,
                outlineID: this.options.newRoot
            });
        } else {
            assert(this.options.dockView==null,
            "How did we get dockElem in PanelRoot?");
            this.dropSource = new NodeDropSource({
                activeID: this.options.activeID,
                outlineID: this.options.oldRoot,
                dockView:this.options.dockView,
                useDock:true,
                dockTextOnly:true,
                usePlaceholder:false
            });
            this.dropTarget = new PanelDropTarget({
                panelID: View.get(this.options.oldRoot).panelView.id,
                activeID:this.options.activeID,
                useFadeOut: true
            });
        }
    }
    contextStep() {
        var that = this;
        // need to do this before createDockElem
                var c:typeof ActionManager;
                c = ActionManager;
                if (c.actions.at(c.lastAction) !== that) {
                    console.log('ERROR: lastAction is not this');
                    debugger;
                }
                var prevAction:Action = <Action>c.actions.at(c.lastAction-1);
                if ((prevAction.type==='CollapseAction')&&
                    (prevAction.options.activeID === that.options.activeID)) {
                    // todo: this is a bit redundant with CollapseAction
                    var activeModel= that.getModel(that.options.activeID);
                    activeModel.set('collapsed', (<CollapseAction>prevAction).oldCollapsed);
                    for (var o in OutlineRootView.outlinesById) {
                        OutlineRootView.outlinesById[o].setData(
                            that.options.activeID,
                            (<CollapseAction>prevAction).oldViewCollapsed[o]);
                        var activeView = activeModel.views[o];
                        if (activeView) {
                            activeView.setCollapsed((<CollapseAction>prevAction).oldViewCollapsed[o]);
                        }
                    }
                    prevAction.undone = true;
                    prevAction.lost = true;
                }
    }
    execModel() {
        this.addQueue(['newModelAdd'], [['context']], function() {});
    }
    execView(outline) {
        var that:PanelRootAction = this;
        this.addQueue(['view', outline.nodeRootView.id], ['newModelAdd','anim'], function() {
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
