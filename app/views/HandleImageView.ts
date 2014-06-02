///<reference path="View.ts"/>
m_require("app/views/ImageView.js");
class HandleImageView extends ImageView {
    parentView:NodeHeaderView;
    init() {
        this.isClickable = true;
    }
    value:string = 'theme/images/circle.png';
    cssClass = 'drag-handle disclose ui-disable-scroll';
    renderUpdate() {
        var node:NodeView = this.nodeView;
        if (node.isLeaf) {
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
