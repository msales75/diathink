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
            function() {
                return $D.Action.checkTextChange(li.header.name.text.id);
            },
            function():{action;activeID;collapsed;oldRoot;newRoot;focus} {
                if (!liElem.hasClass('branch')) {
                    return null;
                }
                return {
                    action: $D.CollapseAction,
                    activeID: li.value.cid,
                    collapsed: !liElem.hasClass('collapsed'),
                    oldRoot: li.nodeRootView.id,
                    newRoot: li.nodeRootView.id,
                    focus: false
                };
            });
    }
    onDoubleClick() {
        var li:NodeView = this.nodeView;
        ActionManager.schedule(
            function() {
                return $D.Action.checkTextChange(li.header.name.text.id);
            },
            function() {
                return {
                    action: $D.RootAction,
                    activeID: li.value.cid,
                    oldRoot: li.nodeRootView.id,
                    newRoot: 'new'
                };
            });
    }
}
