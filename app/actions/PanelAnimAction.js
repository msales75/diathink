///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/animations/AnimatedAction.js");

var PanelAnimAction = (function (_super) {
    __extends(PanelAnimAction, _super);
    function PanelAnimAction() {
        _super.apply(this, arguments);
    }
    PanelAnimAction.prototype.panelPrep = function () {
        return;
        var r = this.runtime;
        var activeLineView;
        if (r.rOldType !== 'panel') {
            return;
        }

        // todo: next:
        // similar to oldLinePlace and newLinePlace, but for only one view.
        // step 1: replace original with old-placeholder
        //    might animate to lose space if disappearing
        // step 2: create new-placeholder
        //    visual-placeholder rendered w/o children if panel
        // we need paneldock when moving to a panel, or when undoing back to a panel
        var panelContext = r.rNewPanelContext;

        var activeView = this.getNodeView(this.options.activeID, this.options.oldRoot);
        var drawlayer = $('#' + View.getCurrentPage().drawlayer.id);

        // dock item to newPanel
        var hiddenbread = new BreadcrumbView({});

        // .breadcrumbs-dock hides last breadcrumb-item
        // hiddenbread.updateValue(this.getModel(this.options.activeID));
        var item = $(hiddenbread.render()).addClass('breadcrumbs-dock').appendTo(drawlayer);
        hiddenbread.updateValue(); // todo: this won't work
        var endBreadcrumbHeight = item[0].clientHeight;

        // if there's no helper, create a docking-clone
        if (r.createDockElem) {
            // activeView = activeView.header.name.text;
            this.options.dockElem = $('#' + activeLineView.id)[0].cloneNode(true);
        }
        // prepare to dock into panelContext
        // deal with panel-object-format for helper-object?
        // determine docking destination-coordinates
        // expand height of breadcrumb-box if needed
        // fade-in hidden breadcrumb-box over original
        // change DOM content at the end, destroying animated one
        // add destination-placeholder at activeID
        // mark title-text location in
        // fade out any lost-breadcrumbs; transform breadcrumb-hyperlink into text.
    };
    return PanelAnimAction;
})(AnimatedAction);
//# sourceMappingURL=PanelAnimAction.js.map
