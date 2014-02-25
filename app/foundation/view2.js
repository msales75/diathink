var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var View = (function () {
    function View(obj) {
        this.Class = View;
        this.id = null;
        this.elem = null;
        this.isView = true;
        this.isTemplate = false;
        this.value = null;
        this.isDragHandle = false;
        this.isScrollable = false;
        this.isClickable = false;
        this.childSlots = {};
        this.childList = null;
        this.parentView = null;
        this.nodeView = null;
        this.scrollView = null;
        this.handleView = null;
        this.swipeView = null;
        this.clickView = null;
        this.onClick = null;
        if ((obj === undefined) || (obj.id === undefined)) {
            this.id = View.getNextId();
        } else {
            assert(View.get(obj.id) == null, "Duplicate id specified in view constructor");
        }
        _.extend(this, obj);
        View.viewList[this.id] = this;

        if (this.isTemplate) {
            // if children are not yet instantiated, so instantiate them here
            var childViews = this.Class.childSlotTypes;
            for (var i in childViews) {
                this[childViews[i]] = new this[childViews[i]]({
                    isTemplate: true,
                    parentView: this
                });
            }
        } else {
            for (var i in childViews) {
                this[childViews[i]].parentView = this;
            }
        }
    }
    View.getNextId = function () {
        this.nextId = this.nextId + 1;
        return 'm_' + this.nextId;
    };

    View.get = function (v) {
        return this.viewList[v];
    };
    View.getFromElement = function (v) {
        while (!(v.id && this.viewList[v.id]) && v.parentNode && (v !== document.body)) {
            v = v.parentNode;
        }
        if (v.id) {
            return this.viewList[v.id];
        } else {
            return null;
        }
    };

    View.prototype.render = function () {
    };
    View.prototype.renderUpdate = function () {
    };
    View.prototype.destroy = function () {
    };
    View.prototype.renderChildViews = function () {
    };
    View.prototype.saveContext = function () {
    };
    View.prototype.validateContext = function () {
    };
    View.prototype.renderAt = function () {
    };
    View.prototype.themeChildViews = function () {
    };
    View.prototype.style = function () {
    };
    View.prototype.setRootID = function (id) {
    };
    View.prototype.addClass = function (name) {
    };
    View.prototype.removeClass = function (name) {
    };
    View.name = 'View';

    View.nextId = 0;
    View.focused = null;
    View.hovering = null;

    View.childListType = null;
    View.childSlotTypes = [];
    return View;
})();

var NodeView = (function (_super) {
    __extends(NodeView, _super);
    function NodeView() {
        _super.apply(this, arguments);
    }
    NodeView.prototype.focus = function () {
    };
    NodeView.prototype.blur = function () {
    };

    NodeView.prototype.setValueFromDOM = function () {
    };
    NodeView.prototype.themeUpdate = function () {
    };
    return NodeView;
})(View);
var HandleView = (function (_super) {
    __extends(HandleView, _super);
    function HandleView() {
        _super.apply(this, arguments);
    }
    HandleView.prototype.dragStart = function () {
    };
    return HandleView;
})(View);
var ScrollView = (function (_super) {
    __extends(ScrollView, _super);
    function ScrollView() {
        _super.apply(this, arguments);
    }
    ScrollView.prototype.scrollStart = function () {
    };
    return ScrollView;
})(View);
var SwipeView = (function (_super) {
    __extends(SwipeView, _super);
    function SwipeView() {
        _super.apply(this, arguments);
    }
    SwipeView.prototype.swipeStart = function () {
    };
    return SwipeView;
})(View);
//# sourceMappingURL=view2.js.map
