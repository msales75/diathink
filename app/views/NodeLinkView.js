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
        this.top = offset.top;
        this.left = offset.left;
        if (this.parentView.textOffset.left === undefined) {
            this.parentView.resize();
        }
        $(this.elem).css({
            top: String(this.top + this.parentView.textOffset.top) + 'px',
            left: String(this.left + this.parentView.textOffset.left) + 'px'
        });
    };
    NodeLinkView.prototype.onClick = function () {
        var that = this;
        if (this.panelView.childPanel != null) {
            // change-root child panel
            ActionManager.simpleSchedule(View.focusedView, function () {
                return {
                    actionType: PanelRootAction,
                    activeID: that.value.cid,
                    oldRoot: that.panelView.childPanel.outline.alist.nodeRootView.id,
                    newRoot: 'new'
                };
            });
        } else {
            ActionManager.simpleSchedule(View.focusedView, function () {
                return {
                    actionType: PanelCreateAction,
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
    return NodeLinkView;
})(View);
//# sourceMappingURL=NodeLinkView.js.map
