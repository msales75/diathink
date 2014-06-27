var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/View.js");

var NodeLinkCountView = (function (_super) {
    __extends(NodeLinkCountView, _super);
    function NodeLinkCountView() {
        _super.apply(this, arguments);
        this.cssClass = 'linkcount';
        this.numLinks = 0;
        this.buttonContent = '';
    }
    NodeLinkCountView.prototype.init = function () {
        this.isClickable = true;
    };

    NodeLinkCountView.prototype.render = function () {
        _super.prototype.render.call(this);
        if (this.numLinks == 0) {
            this.disable();
        }
        return this.elem;
    };

    NodeLinkCountView.prototype.addLink = function () {
        ++this.numLinks;
        this.buttonContent = '<div class="numlinks">' + this.numLinks + '</div>';
        var html = '<img src="' + this.value + '" alt="' + this.value + '"/>' + this.buttonContent;
        this.elem.innerHTML = html;
        this.enable();
    };

    NodeLinkCountView.prototype.renderUpdate = function () {
        // this.elem.src = this.value;
    };
    NodeLinkCountView.prototype.layoutDown = function () {
        var p = this.parentView.layout;
        this.layout = {
            top: Math.round(.05 * View.fontSize),
            left: p.width - Math.round(1.55 * View.fontSize),
            width: Math.round(1.5 * View.fontSize),
            height: Math.round(1.5 * View.fontSize)
        };
    };
    NodeLinkCountView.prototype.onClick = function (params) {
        if (this.isEnabled) {
            this.start();
        }
        var collection = new OutlineNodeCollection();
        collection.append('5hc3Qh9gizqM_1197', OutlineNodeModel.getById('5hc3Qh9gizqM_1197'));
        collection.append('5hc3Qh9gizqM_1269', OutlineNodeModel.getById('5hc3Qh9gizqM_1269'));
        collection.append('5hc3Qh9gizqM_1261', OutlineNodeModel.getById('5hc3Qh9gizqM_1261'));

        ActionManager.schedule(function () {
            if (!View.focusedView) {
                return null;
            }
            return Action.checkTextChange(View.focusedView.header.name.text.id);
        }, function () {
            return {
                actionType: PanelCreateAction,
                name: 'Create search panel',
                activeID: 'search',
                prevPanel: View.getCurrentPage().content.gridwrapper.grid.listItems.last(),
                focus: false,
                searchList: collection
            };
        });
    };
    return NodeLinkCountView;
})(ButtonView);
//# sourceMappingURL=NodeLinkCountView.js.map
