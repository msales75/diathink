var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/GridView.js");

var PanelGridView = (function (_super) {
    __extends(PanelGridView, _super);
    function PanelGridView() {
        _super.apply(this, arguments);
        this.cssClass = "scroll-container";
        this.panelManager = $D.PanelManager;
        this.layout = TWO_COLUMNS;
    }
    PanelGridView.prototype.init = function () {
        this.Class = PanelGridView;
        this.childViewTypes = {
            scroll1: PanelView,
            scroll2: PanelView
        };
    };
    return PanelGridView;
})(GridView);
//# sourceMappingURL=PanelGridView.js.map
