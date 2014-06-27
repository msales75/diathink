///<reference path="View.ts"/>
m_require("app/views/ImageView.js");
class HandleImageView extends ImageView {
    parentView:NodeHeaderView;
    isDiscussion:boolean;
    init() {
        this.isClickable = true;
    }
    updateValue() {
        if (this.panelView && this.panelView.browseChat && (this.nodeView.parentView===this.nodeRootView)) {
            this.isDiscussion = true;
        } else {
            this.isDiscussion = false;
        }
    }
    render() {
        super.render();
        if (this.nodeView instanceof ChatBoxView) {
            this.elem.style.display = 'none';
        }
        return this.elem;
    }
    value:string = 'theme/images/circle.png';
    cssClass = 'drag-handle disclose ui-disable-scroll';
    renderUpdate() {
        var node:NodeView = this.nodeView;
        if (this.isDiscussion) {
            this.value = 'theme/images/plus.png';
        } else if (node.isLeaf) {
            this.value = 'theme/images/circle.png';
        } else {
            if (node.isCollapsed) {
                this.value = 'theme/images/plus.png';
            } else {
                this.value = 'theme/images/minus.png';
            }
        }
        super.renderUpdate();
    }
    layoutDown() {
        this.layout = {
            top: Math.round(.05*View.fontSize),
            left: Math.round(.05*View.fontSize),
            width: Math.round(1.5*View.fontSize),
            height: Math.round(1.5*View.fontSize)
        };
    }
    onClick(params:DragStartI) {
        var li:NodeView = this.nodeView;
        if (!this.nodeRootView) {return;}
        if (this.isDiscussion) {
            // console.log("Discussion node clicked");
            ActionManager.schedule(
                function():SubAction {
                    if (!View.focusedView) {return null;}
                    return Action.checkTextChange(View.focusedView.header.name.text.id);
                },
                function():SubAction {
                    return {
                        actionType: PanelCreateAction,
                        name: 'Create panel',
                        activeID: li.value.attributes.children.last(),
                        prevPanel: li.panelView.id,
                        oldRoot: li.nodeRootView.id,
                        newRoot: 'new',
                        focus: false
                    };
                },
                function():SubAction {
                    return {
                        actionType: PanelCreateAction,
                        name: 'Create panel',
                        activeID: li.value.attributes.children.first(),
                        prevPanel: li.panelView.id,
                        oldRoot: li.nodeRootView.id,
                        newRoot: 'new',
                        focus: false
                    };
                },
                function():SubAction {
                    (<JQueryStaticD>$).postMessage(
                        (<JQueryStaticD>$).toJSON({
                            command: 'script',
                            mesg: {}
                        }),
                        'http://diathink.com/',
                        window.frames['forwardIframe']);
                    return {
                        actionType: PanelCreateAction,
                        delete: true,
                        name: 'Close rooms list',
                        activeID: li.panelView.value.cid,
                        panelID: li.panelView.id,
                        focus: false
                    };
                });
            return;
        }
        var liElem = $(li.elem);
        ActionManager.schedule(
            function():SubAction {
                if (!View.focusedView) {return null;}
                return Action.checkTextChange(View.focusedView.header.name.text.id);
            },
            function():SubAction {
                if (li.isLeaf) {
                    return null;
                }
                return {
                    actionType: CollapseAction,
                    name: li.isCollapsed?'Expand list':'Collapse list',
                    activeID: li.value.cid,
                    collapsed: !li.isCollapsed,
                    oldRoot: li.nodeRootView.id,
                    newRoot: li.nodeRootView.id,
                    focus: false
                };
            });
    }
    onDoubleClick(params:DragStartI) {
        var li:NodeView = this.nodeView;
        ActionManager.schedule(
            function():SubAction {
                if (!View.focusedView) {return null;}
                return Action.checkTextChange(View.focusedView.header.name.text.id);
            },
            function():SubAction {
                return {
                    actionType: PanelRootAction,
                    name: 'Hoist',
                    activeID: li.value.cid,
                    oldRoot: li.nodeRootView.id,
                    newRoot: 'new'
                };
            });
    }
    validate() {
        super.validate();
        assert(this.handleView === this,
            "View "+this.id+" is a handleView that doesn't know it");

    }
}
