var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ImageView.js");
var HandleImageView = (function (_super) {
    __extends(HandleImageView, _super);
    function HandleImageView() {
        _super.apply(this, arguments);
        this.value = 'theme/images/drag_icon.png';
        this.cssClass = 'drag-handle disclose ui-disable-scroll';
    }
    HandleImageView.prototype.init = function () {
        this.Class = HandleImageView;
        this.isClickable = true;
    };

    HandleImageView.prototype.onClick = function () {
        var li = this.nodeView;
        var liElem = $(li.elem);
        ActionManager.schedule(function () {
            return Action.checkTextChange(li.header.name.text.id);
        }, function () {
            if (!liElem.hasClass('branch')) {
                return null;
            }
            return {
                action: CollapseAction,
                activeID: li.value.cid,
                collapsed: !liElem.hasClass('collapsed'),
                oldRoot: li.nodeRootView.id,
                newRoot: li.nodeRootView.id,
                focus: false
            };
        });
    };
    HandleImageView.prototype.onDoubleClick = function () {
        var li = this.nodeView;
        ActionManager.schedule(function () {
            return Action.checkTextChange(li.header.name.text.id);
        }, function () {
            return {
                action: PanelRootAction,
                activeID: li.value.cid,
                oldRoot: li.nodeRootView.id,
                newRoot: 'new'
            };
        });
    };
    return HandleImageView;
})(ImageView);
//# sourceMappingURL=HandleImageView.js.map
