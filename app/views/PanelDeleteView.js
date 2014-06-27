var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ImageView.js");

var PanelDeleteView = (function (_super) {
    __extends(PanelDeleteView, _super);
    function PanelDeleteView() {
        _super.apply(this, arguments);
        this.cssClass = "delete-button";
        this.value = 'theme/images/delete.png';
    }
    PanelDeleteView.prototype.init = function () {
        this.isHidden = true;
        this.isClickable = true;
    };

    PanelDeleteView.prototype.updateValue = function () {
        if (this.panelView.parentView.value.count === 1) {
            this.isHidden = true;
        } else {
            this.isHidden = false;
        }
    };
    PanelDeleteView.prototype.renderUpdate = function () {
        this.updateValue();
        if (this.isHidden) {
            this.elem.style.display = 'none';
        } else {
            this.elem.style.display = 'block';
        }
    };
    PanelDeleteView.prototype.layoutDown = function () {
        var p = this.parentView.layout;
        if (!this.layout) {
            this.layout = {};
        }
        this.layout.left = p.width - Math.round(1.8 * View.fontSize);
        this.layout.width = Math.round(1.5 * View.fontSize);
        this.layout.height = Math.round(1.5 * View.fontSize);
        this.layout.top = Math.round(0 * View.fontSize);
    };
    PanelDeleteView.prototype.layoutUp = function () {
    };
    PanelDeleteView.prototype.render = function () {
        _super.prototype.render.call(this);
        this.elem.style.zIndex = '1'; // in front of outline
        if (this.isHidden) {
            this.elem.style.display = 'none';
        } else {
            this.elem.style.display = 'block';
        }
        return this.elem;
    };
    PanelDeleteView.prototype.onClick = function (params) {
        if (!this.panelView) {
            return;
        }
        var that = this;
        var panel = this.panelView;
        var activeID;
        if (panel.value == null) {
            activeID = 'search';
        } else {
            activeID = panel.value.cid;
        }
        ActionManager.simpleSchedule(View.focusedView, function () {
            return {
                actionType: PanelCreateAction,
                name: 'Remove panel',
                activeID: activeID,
                delete: true,
                panelID: panel.id,
                focus: false
            };
        });
        /*
        ActionManager.schedule(
        function():SubAction {
        if (!View.focusedView) {return null;}
        return Action.checkTextChange(View.focusedView.header.name.text.id);
        },
        function():SubAction {
        return {
        actionType: InsertIntoAction,
        referenceID: panel.value.cid,
        oldRoot: panel.outline.alist.id,
        newRoot: panel.outline.alist.id,
        focus: true
        };
        });
        */
    };
    return PanelDeleteView;
})(ImageView);
//# sourceMappingURL=PanelDeleteView.js.map
