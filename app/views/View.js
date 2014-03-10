///<reference path="../../frameworks/m.ts"/>
///<reference path="BreadcrumbView.ts"/>
///<reference path="ButtonView.ts"/>
///<reference path="ContainerView.ts"/>
///<reference path="DiathinkView.ts"/>
///<reference path="DrawLayerView.ts"/>
///<reference path="DropLayerView.ts"/>
///<reference path="GridView.ts"/>
///<reference path="HandleImageView.ts"/>
///<reference path="HeaderTitleView.ts"/>
///<reference path="HeaderToolbarView.ts"/>
///<reference path="HiddenDivView.ts"/>
///<reference path="ImageView.ts"/>
///<reference path="LeftSwipeButtonView.ts"/>
///<reference path="ListItemView.ts"/>
///<reference path="ListView.ts"/>
///<reference path="LoaderView.ts"/>
///<reference path="NodeHeaderView.ts"/>
///<reference path="NodeTextView.ts"/>
///<reference path="NodeTextWrapperView.ts"/>
///<reference path="NodeView.ts"/>
///<reference path="OutlineListView.ts"/>
///<reference path="OutlineRootView.ts"/>
///<reference path="OutlineScrollView.ts"/>
///<reference path="PageContentView.ts"/>
///<reference path="PageView.ts"/>
///<reference path="PanelGridView.ts"/>
///<reference path="PanelView.ts"/>
///<reference path="RedoButtonView.ts"/>
///<reference path="RightSwipeButtonView.ts"/>
///<reference path="ScrollSpacerView.ts"/>
///<reference path="ScrollView.ts"/>
///<reference path="SpanView.ts"/>
///<reference path="TextAreaView.ts"/>
///<reference path="ToolbarView.ts"/>
///<reference path="UndoButtonContainerView.ts"/>
///<reference path="UndoButtonView.ts"/>

var View = (function () {
    function View(opts) {
        this.value = null;
        this.childViewTypes = {};
        this.parentView = null;
        this.cssClass = null;
        this.elem = null;
        this.onClick = null;
        this.onDoubleClick = null;
        this.isFocusable = false;
        this.isDragHandle = false;
        this.isScrollable = false;
        this.isSwipable = false;
        this.nodeView = null;
        this.nodeRootView = null;
        this.scrollView = null;
        this.handleView = null;
        this.panelView = null;
        this.clickView = null;
        this.items = 'models';
        // droppable is defined in view.dropboxes
        this.dropboxes = [];
        if ((opts == null) || (opts.id == null)) {
            this.id = View.getNextId();
            delete opts['id'];
        } else {
            assert(View.get(opts.id) == null, "Duplicate id specified in view constructor");
            this.id = opts.id;
        }
        this.init();
        if (opts.parentView) {
            this.registerParent(opts.parentView);
        }
        _.extend(this, opts);
        View.register(this);
        this.updateValue();
        for (var v in this.childViewTypes) {
            if (this.childViewTypes.hasOwnProperty(v)) {
                this[v] = new this.childViewTypes[v]({
                    _name: v,
                    parentView: this
                });
            }
        }
        this.createListItems();
    }
    View.getNextId = function () {
        this.nextId = this.nextId + 1;
        return 'm_' + String(this.nextId);
    };

    View.get = function (id) {
        return this.viewList[id];
    };

    View.getFromElement = function (v) {
        while (!(v.id && this.viewList[v.id]) && v.parentNode && (v !== document.body)) {
            v = v.parentNode;
        }
        if (v.id && this.viewList[v.id]) {
            return this.viewList[v.id];
        } else {
            return null;
        }
    };

    View.prototype._create = function (o) {
        this.elem = document.createElement(o.type);
        this.elem.id = this.id;
        if (o.classes) {
            this.cssClass = o.classes;
            this.elem.className = o.classes;
        }
        if (o.html) {
            this.elem.innerHTML = o.html;
        }
        return this.elem;
    };

    View.register = function (view) {
        this.viewList[view.id] = view;
    };

    View.unregister = function (view) {
        delete this.viewList[view.id];
    };

    View.getPage = function (pageName) {
        var page = M.Application.pages[pageName];
        assert(page != null, 'Page \'' + pageName + '\' not found.');
        return page;
    };

    View.getCurrentPage = function () {
        return this.currentPage;
    };

    View.setCurrentPage = function (page) {
        this.currentPage = page;
    };

    View.prototype.createListItems = function () {
        // check they shouldn't already exist
        assert((!this.elem) || (this.elem.children.length === 0), "createListItems has children when creating more");
        if (this.value instanceof Backbone.Collection) {
            this.listItems = [];
            if (!this.hideList) {
                // ensure you don't render ones that are collapsed
                var models = (this.value).models;
                for (var i = 0; i < models.length; ++i) {
                    this.listItems.push(new this.listItemTemplateView({
                        parentView: this,
                        value: models[i]
                    }));
                }
            }
        }
    };

    View.prototype.registerParent = function (parent) {
        var C = this.Class;
        this.parentView = parent;
        this.nodeView = this instanceof NodeView ? this : parent.nodeView;
        this.scrollView = this instanceof ScrollView ? this : parent.scrollView;
        this.panelView = this instanceof PanelView ? this : parent.panelView;
        this.handleView = this instanceof HandleImageView ? this : parent.handleView;
        this.nodeRootView = this instanceof OutlineRootView ? this : parent.nodeRootView;
        this.clickView = C.isClickable ? this : this.parentView.clickView;
        //this.swipeView = null;
    };

    View.prototype.init = function () {
    };
    View.prototype.updateValue = function () {
    };
    View.prototype.removeListItems = function () {
    };
    View.prototype.themeFirst = function () {
    };
    View.prototype.themeLast = function () {
    };

    View.prototype.render = function () {
        return this.elem;
    };

    View.prototype.destroy = function () {
        var elem = this.elem;
        if (this.nodeRootView && this.value && this.value.clearView) {
            this.value.clearView(this.nodeRootView); // remove view from model-outline
        }
        for (var v in this.childViewTypes) {
            if (this.childViewTypes.hasOwnProperty(v)) {
                var child = this[v];
                if (child) {
                    child.destroy();
                }
            }
        }
        if (elem && elem.parentNode) {
            this.removeListItems();
            elem.parentNode.removeChild(elem);
            this.elem = null;
        }
        View.unregister(this);
    };

    View.prototype.renderChildViews = function () {
        for (var v in this.childViewTypes) {
            if (this.childViewTypes.hasOwnProperty(v)) {
                var child = this[v];
                assert(child != null, 'There is no child view \'' + v + '\' available for (' + (this._name ? this._name + ', ' : '') + '#' + this.id + ')! It will be excluded from the child views and won\'t be rendered.');
                if (child) {
                    assert(child.elem === null, "Rendering item with elem not null");
                    child.render();
                }
            }
        }
    };
    View.prototype.renderListItems = function () {
        for (var i = 0; i < this.listItems.length; ++i) {
            var li = this.listItems[i];
            assert(li.elem === null, "Rendering item with elem not null");
            li.render();

            // post-rendering modifications, based on knowledge of list-placement
            if (i === 0) {
                li.themeFirst();
            }
            if (i === this.value.models.length - 1) {
                li.themeLast();
            }
        }
    };

    View.prototype.setValuePatterns = function (model) {
        var v, record, pattern, regexResult;
        for (v in this.childViewTypes) {
            if (this.childViewTypes.hasOwnProperty(v) && this[v]) {
                this[v].setValuePatterns(model);
            }
        }
        if (this.valuePattern) {
            record = model.attributes; // For compatibility with Backbone.Model
            pattern = this.valuePattern;
            regexResult = /<%=\s+([.|_|-|$|§|@|a-zA-Z0-9\s]+)\s+%>/.exec(pattern);
            if (regexResult) {
                while (regexResult !== null) {
                    if (typeof (record[regexResult[1]]) === 'object') {
                        pattern = record[regexResult[1]];
                        regexResult = null;
                    } else {
                        pattern = pattern.replace(regexResult[0], record[regexResult[1]]);
                        regexResult = /<%=\s+([.|_|-|$|§|@|a-zA-Z0-9\s]+)\s+%>/.exec(pattern);
                    }
                }
                this.value = pattern;
            }
        }
    };

    View.prototype.saveContext = function () {
        var elem = this.elem;
        return {
            prev: (elem.previousSibling),
            next: (elem.nextSibling),
            parent: (elem.parentNode)
        };
    };

    View.prototype.validateContext = function (context) {
        assert(context.parent, '');
        if (context.prev) {
            assert(context.prev.parentNode === context.parent, '');
            assert(context.prev.nextSibling === context.next, '');
        }
        if (context.next) {
            assert(context.next.parentNode === context.parent, '');
            assert(context.next.previousSibling === context.prev, '');
        }
    };

    View.prototype.renderAt = function (context) {
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

    View.prototype.addClass = function (value) {
        // todo: simplify because we can retain class in list-form in View.
        var classes, elem, cur, clazz, j;
        classes = (value || "").match(/\S+/g) || [];
        elem = this.elem;
        cur = elem.nodeType === 1 && (elem.className ? (" " + elem.className + " ").replace(/[\t\r\n]/g, " ") : " ");
        if (cur) {
            j = 0;
            while ((clazz = classes[j++])) {
                if (cur.indexOf(" " + clazz + " ") < 0) {
                    cur += clazz + " ";
                }
            }
            elem.className = cur.trim();
        }
        return this;
    };

    View.prototype.removeClass = function (value) {
        var classes, elem, cur, clazz, j;
        classes = (value || "").match(/\S+/g) || [];
        elem = this.elem;
        cur = elem.nodeType === 1 && (elem.className ? (" " + elem.className + " ").replace(/[\t\r\n]/g, " ") : "");
        if (cur) {
            j = 0;
            while ((clazz = classes[j++])) {
                while (cur.indexOf(" " + clazz + " ") >= 0) {
                    cur = cur.replace(" " + clazz + " ", " ");
                }
            }
            elem.className = value ? cur.trim() : "";
        }
        return this;
    };

    // set rootID for all list-items within this list, recursively
    View.prototype.setRootID = function (view) {
        assert(view instanceof View, "Invalid view for setRootID");
        var id = view.id;
        if ((this.nodeRootView === this) && (this !== view)) {
            // do not change RootID if this is a controlled-node
            return;
        }
        this.nodeRootView = view;
        if ((this instanceof ListView) && (this.value)) {
            var itemlist = this.value[this.items];
            _.each(itemlist, function (item) {
                if (item.views && item.views[id]) {
                    item.views[id].setRootID(view);
                }
            });
        }
        for (var v in this.childViewTypes) {
            if (this.childViewTypes.hasOwnProperty(v)) {
                var child = this[v];
                child.setRootID(view);
            }
        }
    };
    View.nextId = 0;
    View.viewList = {};
    View.currentPage = null;
    return View;
})();
//# sourceMappingURL=View.js.map
