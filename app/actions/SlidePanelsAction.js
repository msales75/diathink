///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/actions/Action.js");

var SlidePanelsAction = (function (_super) {
    __extends(SlidePanelsAction, _super);
    function SlidePanelsAction() {
        _super.apply(this, arguments);
        this.type = 'PanelSlide';
        this.oldLeftPanel = null;
        this.options = { direction: null };
    }
    SlidePanelsAction.prototype.execModel = function () {
        var that = this;
        this.addQueue('newModelAdd', ['context'], function () {
            var PM = PanelManager;
            var grid = View.getCurrentPage().content.grid;
            var o = that.options;
            var dir;
            if (o.direction === 'right') {
                if (o.undo) {
                    dir = 'left';
                } else {
                    dir = 'right';
                }
            } else if (o.direction === 'left') {
                if (o.undo) {
                    dir = 'right';
                } else {
                    dir = 'left';
                }
            }
            if (dir === 'right') {
                PM.leftPanel = PM.prevpanel[PM.leftPanel];
                $D.redrawPanels('right');
            } else if (dir === 'left') {
                PM.leftPanel = PM.nextpanel[PM.leftPanel];
                $D.redrawPanels('left');
            }
            $D.updatePanelButtons();
        });
    };
    SlidePanelsAction.prototype.execView = function (outline) {
        var that = this;
        this.addQueue(['view', outline.nodeRootView.id], ['newModelAdd', 'anim'], function () {
            var r = that.runtime;
        });
    };
    return SlidePanelsAction;
})(Action);
//# sourceMappingURL=SlidePanelsAction.js.map
