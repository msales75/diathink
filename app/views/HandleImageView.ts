///<reference path="View.ts"/>
m_require("app/views/ImageView.js");
class HandleImageView extends ImageView {
    parentView:NodeHeaderView;
    init() {
        this.Class = HandleImageView;
        this.isClickable = true;
    }
    value = 'theme/images/drag_icon.png';
    cssClass = 'drag-handle disclose ui-disable-scroll';
    onClick() {
        var li:NodeView = this.nodeView;
        var liElem = $(li.elem);
        ActionManager.schedule(
            function():SubAction {
                return Action.checkTextChange(li.header.name.text.id);
            },
            function():SubAction {
                if (li.isLeaf) {
                    return null;
                }
                return {
                    actionType: CollapseAction,
                    activeID: li.value.cid,
                    collapsed: !li.isCollapsed,
                    oldRoot: li.nodeRootView.id,
                    newRoot: li.nodeRootView.id,
                    focus: false
                };
            });
    }
    onDoubleClick() {
        var li:NodeView = this.nodeView;
        ActionManager.schedule(
            function():SubAction {
                return Action.checkTextChange(li.header.name.text.id);
            },
            function():SubAction {
                return {
                    actionType: PanelRootAction,
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
