var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
// can also specify special child-parameters in render()
var View = (function () {
    function View(opts) {
        // instance variables
        this.Class = View;
        this.id = null;
        this.elem = null;
        this.value = null;
        this.isDragHandle = false;
        this.isScrollable = false;
        this.isClickable = false;
        this.childSlots = {};
        this.childList = null;
        this.parentView = null;
        this.parentContext = null;
        this.nodeView = null;
        this.nodeRootView = null;
        this.scrollView = null;
        this.handleView = null;
        this.swipeView = null;
        this.clickView = null;
        this.onClick = null;
        var name;
        if (opts.id === undefined) {
            this.id = View.getNextId();
        } else {
            assert(View.get(opts.id) == null, "Duplicate id specified in view constructor");
            this.id = opts.id;
        }
        View.viewList[this.id] = this;
        if (opts.parent) {
            this.registerParent(opts.parent);
        }

        // fill childSlots
        var childTypes = this.Class.childSlotTypes;
        for (name in childTypes) {
            assert(!this[name], "Name " + name + " already set in class.");
            this.childSlots[name] = new childTypes[name]({ parent: this, mesg: opts.mesg });
        }
        this.render(); // do we want this in constructor?
    }
    // static functions
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
    View.getNextId = function () {
        this.nextId = this.nextId + 1;
        return 'm_' + this.nextId;
    };

    View.prototype.registerParent = function (parent) {
        var C = this.Class;
        this.parentView = parent;
        this.nodeView = C instanceof NodeView ? this : this.parentView.nodeView;
        this.scrollView = C instanceof ScrollView ? this : this.parentView.nodeView;
        this.handleView = C.isDragHandle ? this : this.parentView.handleView;
        this.nodeRootView = C instanceof NodeRootView ? this : this.parentView.nodeRootView;
        this.swipeView = null;
        this.clickView = C.isClickable ? this : this.parentView.clickView;
    };

    View.prototype.render = function () {
        assert(false, "Called virtual View::render()");
        return null;
    };

    View.prototype.insertAt = function (location, node) {
        var C = this.Class;
        var self = this;
        var root = this.elem;
        // todo: insert node at location
    };
    View.prototype.updateList = function () {
        var C = this.Class;
        var self = this;
        _.each(this.value.models, function (model, i) {
            new C.childListType({
                parentView: self
            });
            // C.childListLocation:ChildLocation;
            // this.childList
            // todo: create list-items
        });
    };

    View.prototype.renderChildren = function () {
        var C = this.Class;
        var self = this;
        var slotName;

        for (slotName in C.childSlotTypes) {
            this.insertAt(C.childSlotLocations[slotName], this.childSlots[slotName].render());
            this.childSlots[slotName].renderChildren();
        }

        // deal with list-items
        if ((C.childListType != null) && (this.value != null)) {
            this.updateList();
        }
    };

    View.prototype.replaceChild = function () {
        // assume child is already rendered
        // call registerParent
    };
    View.prototype.redraw = function (opts) {
        // options: skipSlots, skipList, skipSelf
        // redraw entire view -- tricky?
        // must create new DOM entry,
        // re-render all subviews in the new fragment ('re-render')
        // then inject fragment into DOM
        // and preserve focus/hover (call class-update functions?)
        // (or view references?)
        // use replaceChild of parentView.
    };
    View.prototype.transfer = function () {
        // without removing any views or DOM elements
    };
    View.prototype.insertListChild = function () {
    };
    View.prototype.removeListChild = function () {
    };

    View.prototype.destroy = function () {
        var elem = this.elem;
        if (this.id) {
            if (!elem) {
                elem = $('#' + this.id)[0];
            }
            var childViews = this.getChildViewsAsArray();
            for (var i in childViews) {
                if (this[childViews[i]]) {
                    if (elem) {
                        this[childViews[i]].destroy($(elem).find('#' + this[childViews[i]].id)[0]);
                    } else {
                        this[childViews[i]].destroy();
                    }
                }
            }
            if (elem) {
                $(elem).remove();
            }
            M.ViewManager.unregister(this);
        }
    };
    View.prototype.renderAt = function () {
        this.validateContext(context);
        if (context.prev) {
            return $(context.prev).after(this.render());
        } else if (context.next) {
            return $(context.next).before(this.render());
        } else {
            return $(context.parent).prepend(this.render());
        }
    };
    View.prototype.secure = function (str) {
        return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };
    View.prototype.validate = function () {
        // render fresh detached fragment and compare structure
    };
    View.prototype.setRootID = function (id) {
        if (!id) {
            id = this.id;
        }
        if (this.rootID && (this.rootID === this.id) && (this.id !== id)) {
            // do not change RootID if this is a controlled-node
            return;
        }
        this.rootID = id;
        if ((this.type === 'M.ListView') && (this.value)) {
            var itemlist = this.value[this.items];
            _.each(itemlist, function (item, index) {
                item.setRootID(id);
            });
        }
        var childViewsArray = this.getChildViewsAsArray();
        for (var i in childViewsArray) {
            this[childViewsArray[i]].setRootID(id);
        }
    };
    View.prototype.addClass = function (name) {
        $('#' + this.id).addClass(name);
    };
    View.prototype.removeClass = function (name) {
        $('#' + this.id).removeClass(name);
    };
    View.type = 'View';

    View.nextId = 0;

    View.focused = null;
    View.hovering = null;

    View.childSlotTypes = {};

    View.childListType = null;
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
var NodeRootView = (function (_super) {
    __extends(NodeRootView, _super);
    function NodeRootView() {
        _super.apply(this, arguments);
    }
    return NodeRootView;
})(NodeView);

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
var TextEditView = (function (_super) {
    __extends(TextEditView, _super);
    function TextEditView() {
        _super.apply(this, arguments);
    }
    return TextEditView;
})(View);
//# sourceMappingURL=view2.js.map
