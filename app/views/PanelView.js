var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
///<reference path="../events/Router.ts"/>
///<reference path="../PanelManager.ts"/>
m_require("app/views/ContainerView.js");
var PanelView = (function (_super) {
    __extends(PanelView, _super);
    function PanelView() {
        _super.apply(this, arguments);
        this.value = null;
    }
    PanelView.prototype.init = function () {
        this.Class = PanelView;
        this.childViewTypes = {
            breadcrumbs: BreadcrumbView,
            outline: OutlineScrollView
        };
    };

    PanelView.prototype.cachePosition = function () {
        // todo: cache top/left/height/width
        var el = $(this.elem);
        var offset = el.offset();
        this.top = offset.top;
        this.left = offset.left;
        this.height = this.elem.clientHeight;
        this.width = this.elem.clientWidth;
    };

    // todo: View.destroy generally has options of saving context?
    PanelView.prototype.destroy = function () {
        var c, elem = this.elem;
        if (elem) {
            var c = this.saveContext();
        } else {
            c = null;
        }

        // this.outline.alist.destroy();
        // this.outline.alist = null;
        View.prototype.destroy.call(this);
        return c;
    };

    PanelView.prototype.changeRoot = function (model, rootID) {
        var newlist;
        var c = this.outline.alist.destroy();
        if (model === undefined) {
            model = null;
        }
        this.value = model;
        newlist = new OutlineRootView({ id: rootID, parentView: this.outline }); // new rootID
        this.outline.alist = newlist;

        // problem: ui-scrollview-view doesn't always exist until theming
        this.outline.alist.renderAt(c);
        this.breadcrumbs.updateValue();
        this.breadcrumbs.renderUpdate();
        this.cachePosition();
        $D.router.dragger.refresh();

        // $('#' + View.getCurrentPage().id).nestedSortable('update');
        // todo: this breaks dragging after changeroot
        $(window).resize(); // fix height of new panel, spacer
        PanelManager.rootViews[this.id] = newlist.id;
        PanelManager.rootModels[this.id] = model;
        return newlist.id;
    };
    return PanelView;
})(ContainerView);
//# sourceMappingURL=PanelView.js.map
