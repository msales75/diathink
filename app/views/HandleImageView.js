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
        this.value = 'theme/images/circle.png';
        this.cssClass = 'drag-handle disclose ui-disable-scroll';
    }
    HandleImageView.prototype.init = function () {
        this.isClickable = true;
    };
    HandleImageView.prototype.updateValue = function () {
        if (this.panelView && this.panelView.browseChat && (this.nodeView.parentView === this.nodeRootView)) {
            this.isDiscussion = true;
        } else {
            this.isDiscussion = false;
        }
    };
    HandleImageView.prototype.render = function () {
        _super.prototype.render.call(this);
        if (this.nodeView instanceof ChatBoxView) {
            this.elem.style.display = 'none';
        }
        return this.elem;
    };

    HandleImageView.prototype.renderUpdate = function () {
        var node = this.nodeView;
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
        _super.prototype.renderUpdate.call(this);
    };
    HandleImageView.prototype.layoutDown = function () {
        this.layout = {
            top: Math.round(.05 * View.fontSize),
            left: Math.round(.05 * View.fontSize),
            width: Math.round(1.5 * View.fontSize),
            height: Math.round(1.5 * View.fontSize)
        };
    };
    HandleImageView.prototype.onClick = function (params) {
        var li = this.nodeView;
        if (!this.nodeRootView) {
            return;
        }
        if (this.isDiscussion) {
            // console.log("Discussion node clicked");
            ActionManager.schedule(function () {
                if (!View.focusedView) {
                    return null;
                }
                return Action.checkTextChange(View.focusedView.header.name.text.id);
            }, function () {
                return {
                    actionType: PanelCreateAction,
                    name: 'Create panel',
                    activeID: li.value.attributes.children.last(),
                    prevPanel: li.panelView.id,
                    oldRoot: li.nodeRootView.id,
                    newRoot: 'new',
                    focus: false
                };
            }, function () {
                return {
                    actionType: PanelCreateAction,
                    name: 'Create panel',
                    activeID: li.value.attributes.children.first(),
                    prevPanel: li.panelView.id,
                    oldRoot: li.nodeRootView.id,
                    newRoot: 'new',
                    focus: false
                };
            }, function () {
                $.postMessage($.toJSON({
                    command: 'script',
                    mesg: {}
                }), 'http://diathink.com/', window.frames['forwardIframe']);
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
        ActionManager.schedule(function () {
            if (!View.focusedView) {
                return null;
            }
            return Action.checkTextChange(View.focusedView.header.name.text.id);
        }, function () {
            if (li.isLeaf) {
                return null;
            }
            return {
                actionType: CollapseAction,
                name: li.isCollapsed ? 'Expand list' : 'Collapse list',
                activeID: li.value.cid,
                collapsed: !li.isCollapsed,
                oldRoot: li.nodeRootView.id,
                newRoot: li.nodeRootView.id,
                focus: false
            };
        });
    };
    HandleImageView.prototype.onDoubleClick = function (params) {
        var li = this.nodeView;
        ActionManager.schedule(function () {
            if (!View.focusedView) {
                return null;
            }
            return Action.checkTextChange(View.focusedView.header.name.text.id);
        }, function () {
            return {
                actionType: PanelRootAction,
                name: 'Hoist',
                activeID: li.value.cid,
                oldRoot: li.nodeRootView.id,
                newRoot: 'new'
            };
        });
    };
    HandleImageView.prototype.validate = function () {
        _super.prototype.validate.call(this);
        assert(this.handleView === this, "View " + this.id + " is a handleView that doesn't know it");
    };
    return HandleImageView;
})(ImageView);
//# sourceMappingURL=HandleImageView.js.map
