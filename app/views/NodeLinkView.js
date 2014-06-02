var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/View.js");
var NodeLinkView = (function (_super) {
    __extends(NodeLinkView, _super);
    function NodeLinkView() {
        _super.apply(this, arguments);
    }
    NodeLinkView.prototype.init = function () {
        this.isClickable = true;
    };

    NodeLinkView.prototype.getText = function () {
        var value = String(this.value.get('text'));
        if (value.match(/[a-zA-Z0-9_\-]/) == null) {
            return '[Link]';
        } else {
            return '[' + value + ']';
        }
    };

    NodeLinkView.prototype.render = function () {
        this._create({
            type: 'div',
            classes: 'node-link',
            html: this.getText()
        });
        return this.elem;
    };

    NodeLinkView.prototype.setOffset = function (offset) {
        if (!this.layout) {
            this.layout = {};
        }
        this.layout.top = offset.top + Math.round(.15 * View.fontSize);
        this.layout.left = offset.left + Math.round(.18 * View.fontSize);
        $(this.elem).css({
            top: String(this.layout.top) + 'px',
            left: String(this.layout.left) + 'px'
        });
    };

    NodeLinkView.prototype.onClick = function (params) {
        var that = this;
        if (this.panelView.childPanel != null) {
            // change-root child panel
            ActionManager.simpleSchedule(View.focusedView, function () {
                if (that.panelView.childPanel.value === that.value) {
                    return {
                        actionType: PanelCreateAction,
                        name: 'Close link panel',
                        delete: true,
                        activeID: that.value.cid,
                        prevPanel: that.panelView.id,
                        panelID: that.panelView.childPanel.id,
                        focus: false
                    };
                } else {
                    return {
                        actionType: PanelRootAction,
                        name: 'Update link panel',
                        activeID: that.value.cid,
                        oldRoot: that.panelView.childPanel.outline.alist.nodeRootView.id,
                        newRoot: 'new'
                    };
                }
            });
        } else {
            ActionManager.simpleSchedule(View.focusedView, function () {
                return {
                    actionType: PanelCreateAction,
                    name: 'Open link panel',
                    isSubpanel: true,
                    activeID: that.value.cid,
                    prevPanel: that.panelView.id,
                    oldRoot: that.nodeRootView.id,
                    newRoot: 'new',
                    focus: false
                };
            });
        }
    };

    NodeLinkView.prototype.onDoubleClick = function (params) {
        // delete link, possibly closing other panel
        // check if next-panel is a child
        var that = this;
        var panel = this.panelView;
        ActionManager.simpleSchedule(View.focusedView, function () {
            if (panel.childPanel == null) {
                return {
                    actionType: AddLinkAction,
                    name: 'Remove link',
                    delete: true,
                    activeID: that.value.cid,
                    referenceID: that.nodeView.value.cid,
                    focus: false
                };
            } else {
                return null;
            }
        });
    };
    return NodeLinkView;
})(View);
//# sourceMappingURL=NodeLinkView.js.map
