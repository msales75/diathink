///<reference path="../../frameworks/m.ts"/>

var View = (function () {
    function View(obj) {
        this.type = 'View';
        this.isView = YES;
        this.value = null;
        this.id = null;
        this._name = null;
        this.Class = View;
        this.parentView = null;
        this.cssClass = null;
        this.cssClassOnError = null;
        this.cssClassOnInit = null;
        this.elem = null;
        this.rootID = null;
        this.isClickable = false;
        this.isDoubleClickable = false;
        this.isFocusable = false;
        this.isSwipable = false;
        this.html = '';
        this.isTemplate = false;
        this.items = 'models';
        // droppable is defined in view.dropboxes
        this.dropboxes = [];
        if ((obj === undefined) || (obj.id === undefined)) {
            this.id = View.getNextId();
        } else {
            assert(View.get(obj.id) == null, "Duplicate id specified in view constructor");
        }
        _.extend(this, obj);
        View.register(this);
        this.childViewTypes = this.getChildTypes();
        this.onDesign();
        for (var v in this.childViewTypes) {
            if (this.childViewTypes.hasOwnProperty(v)) {
                this[v] = new this.childViewTypes[v]({
                    parentView: this
                });
            }
        }
    }
    View.getNextId = function () {
        this.nextId = this.nextId + 1;
        return this.idPrefix + String(this.nextId);
    };

    View.get = function (id) {
        return this.viewList[id];
    };

    View.register = function (view) {
        this.viewList[view.id] = view;
    };

    View.unregister = function (view) {
        delete this.viewList[view.id];
    };

    View.getPage = function (pageName) {
        var page = M.Application.pages[pageName];
        if (!page) {
            M.Logger.log('page \'' + pageName + '\' not found.', M.WARN);
        }
        return page;
    };

    View.getCurrentPage = function () {
        return this.currentPage;
    };

    View.setCurrentPage = function (page) {
        this.currentPage = page;
    };

    View.prototype.getChildTypes = function () {
        return {};
    };
    View.prototype.detach = function () {
    };

    View.prototype.destroy = function (elem) {
        if (this.id) {
            if (!elem) {
                elem = $('#' + this.id)[0];
            }
            if (this.rootID && this.value && this.value.clearView) {
                this.value.clearView(this.rootID); // remove view from model-outline
            }
            for (var v in this.childViewTypes) {
                if (this.childViewTypes.hasOwnProperty(v)) {
                    var child = this[v];
                    if (child) {
                        if (elem) {
                            child.destroy($(elem).find('#' + child.id)[0]);
                        } else {
                            child.destroy(null);
                        }
                    }
                }
            }
            if (elem) {
                if (elem.parentNode) {
                    elem.parentNode.removeChild(elem);
                }
            }
            View.unregister(this);
        }
    };

    View.prototype.onDesign = function () {
        // place-holder function for any instantiation
    };

    View.prototype.render = function () {
        this.renderChildViews();
        return this.html;
    };

    View.prototype.renderChildViews = function () {
        for (var v in this.childViewTypes) {
            if (this.childViewTypes.hasOwnProperty(v)) {
                var child = this[v];
                if (child) {
                    child._name = v;
                    child.parentView = this;
                    this.html += child.render();
                } else {
                    M.Logger.log('There is no child view \'' + v + '\' available for ' + this.type + ' (' + (this._name ? this._name + ', ' : '') + '#' + this.id + ')! It will be excluded from the child views and won\'t be rendered.', M.WARN);
                }
            }
        }
        return this.html;
    };

    View.prototype.setValuePatterns = function (model) {
        var v, record, pattern, regexResult;
        for (v in this.childViewTypes) {
            if (this.childViewTypes.hasOwnProperty(v)) {
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

    View.prototype.computeValue = function () {
    };

    View.prototype.theme = function (elem) {
        this.themeChildViews(elem);
    };

    View.prototype.saveContext = function (elem) {
        if (!elem) {
            elem = $('#' + this.id)[0];
        }
        if (!elem) {
            return null;
        }
        return {
            prev: elem.previousSibling,
            next: elem.nextSibling,
            parent: elem.parentNode
        };
    };

    View.prototype.validateContext = function (context) {
        if (!context.parent) {
            debugger;
            return;
        }
        if (context.prev) {
            if (context.prev.parentNode !== context.parent) {
                debugger;
                return;
            }
            if (context.prev.nextSibling !== context.next) {
                debugger;
                return;
            }
        }
        if (context.next) {
            if (context.next.parentNode !== context.parent) {
                debugger;
                return;
            }
            if (context.next.previousSibling !== context.prev) {
                debugger;
            }
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

    View.prototype.themeChildViews = function (elem) {
        if (!elem) {
            elem = $('#' + this.id)[0];
        }
        for (var v in this.childViewTypes) {
            if (this.childViewTypes.hasOwnProperty(v)) {
                var child = this[v];
                child.theme($(elem).find('#' + child.id)[0]);
            }
        }
    };

    View.prototype.secure = function (str) {
        return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };

    View.prototype.addCssClass = function (cssClass) {
        $('#' + this.id).addClass(cssClass);
    };

    View.prototype.removeCssClass = function (cssClass) {
        $('#' + this.id).removeClass(cssClass);
    };

    // set rootID for all list-items within this list, recursively
    View.prototype.setRootID = function (id) {
        if (!id) {
            id = this.id;
        }
        if (this.rootID && (this.rootID === this.id) && (this.id !== id)) {
            // do not change RootID if this is a controlled-node
            return;
        }
        this.rootID = id;
        if ((this.type === 'ListView') && (this.value)) {
            var itemlist = this.value[this.items];
            _.each(itemlist, function (item) {
                if (item.views && item.views[id]) {
                    item.views[id].setRootID(id);
                }
            });
        }
        for (var v in this.childViewTypes) {
            if (this.childViewTypes.hasOwnProperty(v)) {
                var child = this[v];
                child.setRootID(id);
            }
        }
    };
    View.nextId = 0;
    View.idPrefix = 'm_';
    View.viewList = {};
    View.currentPage = null;
    return View;
})();
//# sourceMappingURL=view.js.map
