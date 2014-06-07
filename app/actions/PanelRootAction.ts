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
    runinit() {
        super.runinit();
        if (this.options.anim==='none') {
            this.disableAnimation = true;
        }
    }
    runinit2() {
        var o:ActionOptions = this.options,
            r:RuntimeOptions = this.runtime;
        if (o.anim==='none') {
            this.disableAnimation = true;
        } else {
            if (this.options.undo) {
                if (View.get(this.options.newRoot)) {
                    this.dropSource = new PanelDropSource({
                        activeID: this.oldRootModel.cid,
                        // useFade: true, // todo: need to fix this so it doesn't permanently disappear
                        panelID: View.get(this.options.newRoot).panelView.id
                    });
                    this.dropTarget = new NodeDropTarget({
                        activeID:this.options.activeID,
                        outlineID: this.options.newRoot
                    });
                }
            } else {
                assert(this.options.dockView==null,
                    "How did we get dockElem in PanelRoot?");
                if (View.get(this.options.oldRoot)) {
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
                if (prevAction && (prevAction instanceof CollapseAction)&&
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
        var that = this;
        this.addQueue(['newModelAdd'], [['context']], function() {
            // handle case when panel is not visible to user, update DeadPanel.value and .outlineID
            if (that.options.undo) {
                if (!OutlineRootView.outlinesById[that.options.newRoot]) {
                    assert(DeadView.viewList[that.options.newRoot]!=null, "Outline missing dead or alive");
                    var newOutlineID = DeadView.viewList[that.options.newRoot].parent;
                    var oldOutlineID = DeadView.viewList[that.options.oldRoot].parent;
                    assert(newOutlineID===oldOutlineID, "In changeroot, new and old outlines don't share same panel");
                    var deadoutline:DeadOutlineScroll = <DeadOutlineScroll>DeadView.viewList[newOutlineID];
                    var deadpanel:DeadPanel = <DeadPanel>DeadView.viewList[deadoutline.parent];
                    assert(deadpanel instanceof DeadPanel, "DeadPanel not found");
                    deadpanel.value = that.oldRootModel;
                    deadoutline.rootID = that.options.oldRoot;
                }
            } else {
                if (!OutlineRootView.outlinesById[that.options.oldRoot]) {
                    assert(DeadView.viewList[that.options.oldRoot]!=null, "Outline missing dead or alive");
                    var newOutlineID = DeadView.viewList[that.options.newRoot].parent;
                    var oldOutlineID = DeadView.viewList[that.options.oldRoot].parent;
                    assert(newOutlineID===oldOutlineID, "In changeroot, new and old outlines don't share same panel");
                    var deadoutline:DeadOutlineScroll = <DeadOutlineScroll>DeadView.viewList[newOutlineID];
                    var deadpanel:DeadPanel = <DeadPanel>DeadView.viewList[deadoutline.parent];
                    assert(deadpanel instanceof DeadPanel, "DeadPanel not found");
                    deadpanel.value = OutlineNodeModel.getById(that.options.activeID);
                    deadoutline.rootID = that.options.newRoot;
                }
            }
        });
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
                    if (View.get(that.options.oldRoot).value.count>0) {
                        View.get(that.options.oldRoot).panelView.inserter.hide();
                    } else {
                        View.get(that.options.oldRoot).panelView.inserter.show();
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
                    if (View.get(that.options.newRoot).value.count>0) {
                        View.get(that.options.newRoot).panelView.inserter.hide();
                    } else {
                        View.get(that.options.newRoot).panelView.inserter.show();
                    }
                }
            }

            // that.runtime.status.linePlaceAnim[outline.nodeRootView.id] = 2;
        });
    }
}
