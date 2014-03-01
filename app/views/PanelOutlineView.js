var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../foundation/view.ts"/>
///<reference path="../views/list.ts"/>
///<reference path="../views/list_item.ts"/>
///<reference path="../views/container.ts"/>
///<reference path="../views/BreadcrumbView.ts"/>
///<reference path="../views/OutlineView.ts"/>
///<reference path="../views/subviews.ts"/>
m_require("app/views/OutlineView.js");

var OutlineRootView = (function (_super) {
    __extends(OutlineRootView, _super);
    function OutlineRootView() {
        _super.apply(this, arguments);
        this.idName = 'cid';
        this.items = 'models';
        this.isInset = true;
        this.listItemTemplateView = MyListItem;
        this.deleted = false;
    }
    OutlineRootView.prototype.getChildTypes = function () {
        this.Class = OutlineRootView;
        return {};
    };

    OutlineRootView.prototype.onDesign = function () {
        this.panelView = this.parentView.parentView;
        if (this.panelView.value != null) {
            this.value = this.panelView.value.get('children');
        } else {
            this.value = $D.data;
        }
        this.rootID = this.id;
        this.setRootID(this.id); // Though children haven't been defined yet
        this.deleted = false;
        $D.OutlineManager.add(this.rootID, this);
    };

    OutlineRootView.prototype.postRender = function () {
        var collection, that = this;
        this.renderUpdate(null);

        // update the panel's dimensions
        setTimeout(function () {
            that.parentView.parentView.cachePosition();
        }, 0);
    };

    OutlineRootView.prototype.destroy = function (elem) {
        var i, v, view, models;
        if (!elem) {
            elem = $('#' + this.id)[0];
        }
        var context = this.saveContext(null);
        $D.OutlineManager.remove(this.rootID); // move to graveyard
        this.deleted = true;

        // destroy the list-entries but not the root-view
        if (this.value) {
            models = this.value.models;
            for (i = 0; i < models.length; ++i) {
                if (models[i].views && models[i].views[this.rootID]) {
                    models[i].views[this.rootID].destroy();
                }
            }
        }
        if (elem) {
            if (elem.parentNode) {
                elem.parentNode.removeChild(elem);
            }
        }

        // question: do we unregister it with the view-manager?
        return context;
        // don't destroy outline-ul-shell-view?
    };
    OutlineRootView.prototype.resurrect = function (options) {
        this.parentView = options.parentView;
        this.onDesign();
        return this;
    };

    OutlineRootView.prototype.setData = function (key, val) {
        if (!this.data) {
            this.data = {};
        }
        if (val != null) {
            this.data[key] = val;
        } else {
            delete this.data[key];
        }
    };

    OutlineRootView.prototype.getData = function (key) {
        if (!this.data) {
            return null;
        } else if (this.data[key] == null) {
            return null;
        } else {
            return this.data[key];
        }
    };
    return OutlineRootView;
})(ListView);

var PanelOutlineView = (function (_super) {
    __extends(PanelOutlineView, _super);
    function PanelOutlineView() {
        _super.apply(this, arguments);
        this.value = null;
    }
    PanelOutlineView.prototype.getChildTypes = function () {
        this.Class = PanelOutlineView;
        return {
            breadcrumbs: BreadcrumbView,
            outline: OutlineScrollView
        };
    };

    PanelOutlineView.prototype.cachePosition = function () {
        // todo: cache top/left/height/width
        this.elem = $('#' + this.id);
        var offset = this.elem.offset();
        this.top = offset.top;
        this.left = offset.left;
        this.height = this.elem.height();
        this.width = this.elem.width();
    };

    PanelOutlineView.prototype.destroy = function (elem) {
        var c = this.saveContext(elem);
        this.outline.alist.destroy(null);
        this.outline.alist = null;
        View.prototype.destroy.apply(this, arguments);
        return c;
    };

    PanelOutlineView.prototype.changeRoot = function (model, rootID) {
        var newlist;
        var c = this.outline.alist.destroy(null);
        if (!model) {
            model = null;
        }
        this.value = model;

        if (rootID) {
            newlist = $D.OutlineManager.deleted[rootID].resurrect({ parentView: this.outline });
            assert(newlist && (newlist.panelView.id === this.id), "Root ListView not found in graveyard");
        } else {
            newlist = new OutlineRootView({ parentView: this.outline }); // new rootID
        }

        this.outline.alist = newlist;

        // problem: ui-scrollview-view doesn't always exist until theming
        this.outline.alist.renderAt(c);
        this.breadcrumbs.onDesign();
        this.breadcrumbs.renderUpdate();
        this.theme(null);
        this.outline.alist.postRender();
        $('#' + View.getCurrentPage().id).nestedSortable('update');
        $(window).resize(); // fix height of new panel, spacer
        $D.PanelManager.rootViews[this.id] = newlist.id;
        $D.PanelManager.rootModels[this.id] = model;
        return newlist.id;
    };
    return PanelOutlineView;
})(ContainerView);
//# sourceMappingURL=PanelOutlineView.js.map
