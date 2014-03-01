///<reference path="../../frameworks/m.ts"/>
interface ViewTypeList {
    [name:string] : any
}
interface ViewList {
    [id:string] : View;
}
class View {
    static nextId:number = 0;
    static idPrefix:string = 'm_';
    static viewList:ViewList = {};
    static currentPage = null;

    static getNextId():string {
        this.nextId = this.nextId + 1;
        return this.idPrefix + String(this.nextId);
    }

    static get(id:string) {
        return this.viewList[id];
    }

    static register(view) {
        this.viewList[view.id] = view;
    }

    static unregister(view) {
        delete this.viewList[view.id];
    }

    static getPage(pageName) {
        var page = M.Application.pages[pageName];
        if (!page) {
            M.Logger.log('page \'' + pageName + '\' not found.', M.WARN);
        }
        return page;
    }

    static getCurrentPage() {
        return this.currentPage;
    }

    static setCurrentPage(page) {
        this.currentPage = page;
    }

    public type:string = 'View';
    public isView = YES;
    public value:any = null;
    public id:string = null;
    public _name:string = null;
    public Class:any = View;
    public valuePattern:string;
    public childViewTypes:ViewTypeList;
    public parentView:View = null;
    public cssClass:string = null;
    public cssClassOnError:string = null; // textfieldview
    public cssClassOnInit:string = null; // textfieldview
    public elem:JQuery = null;
    public rootID:string = null; // MS which view's controller is in charge of outline-contents
    public isClickable = false;
    public isDoubleClickable = false;
    public isFocusable = false; // todo: node vs. textarea
    public isSwipable = false;
    public html:string = '';
    public isTemplate:boolean = false;
    public items:string = 'models'; // eliminate
    // droppable is defined in view.dropboxes
    public dropboxes = []; // places to drop objects in drag-mode
    constructor(obj) {
        if ((obj === undefined) || (obj.id === undefined)) {
            this.id = View.getNextId();
        } else { // validate it's not being used
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

    getChildTypes():ViewTypeList {return {};} // override with appropriate types
    detach() {
    }

    destroy(elem:HTMLElement):any {
        if (this.id) {
            if (!elem) {elem = $('#' + this.id)[0];}
            if (this.rootID && this.value && this.value.clearView) {
                this.value.clearView(this.rootID); // remove view from model-outline
            }
            for (var v in this.childViewTypes) {
                if (this.childViewTypes.hasOwnProperty(v)) {
                    var child:View = this[v];
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
    }

    onDesign() {
        // place-holder function for any instantiation
    }

    render() {
        this.renderChildViews();
        return this.html;
    }

    renderChildViews():string {
        for (var v in this.childViewTypes) {
            if (this.childViewTypes.hasOwnProperty(v)) {
                var child:View = this[v];
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
    }

    setValuePatterns(model):void {
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
                    if (typeof(record[regexResult[1]]) === 'object') {
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
    }

    computeValue() {
    }

    theme(elem) {
        this.themeChildViews(elem);
    }

    saveContext(elem) {
        if (!elem) {elem = $('#' + this.id)[0];}
        if (!elem) {return null;}
        return {
            prev: elem.previousSibling,
            next: elem.nextSibling,
            parent: elem.parentNode
        };
    }

    validateContext(context):void {
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
    }

    renderAt(context) {
        this.validateContext(context);
        if (context.prev) {
            return $(context.prev).after(this.render());
        } else if (context.next) {
            return $(context.next).before(this.render());
        } else {
            return $(context.parent).prepend(this.render());
        }
    }

    themeChildViews(elem) {
        if (!elem) {elem = $('#' + this.id)[0];}
        for (var v in this.childViewTypes) {
            if (this.childViewTypes.hasOwnProperty(v)) {
                var child:View = this[v];
                child.theme($(elem).find('#' + child.id)[0]);
            }
        }
    }

    secure(str:string):string {
        return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    addCssClass(cssClass) {
        $('#' + this.id).addClass(cssClass);
    }

    removeCssClass(cssClass) {
        $('#' + this.id).removeClass(cssClass);
    }

    // set rootID for all list-items within this list, recursively
    setRootID(id) {
        if (!id) {id = this.id;}
        if (this.rootID && (this.rootID === this.id) && (this.id !== id)) {
            // do not change RootID if this is a controlled-node
            return;
        }
        this.rootID = id;
        if ((this.type === 'ListView') && (this.value)) {
            var itemlist = this.value[this.items];
            _.each(itemlist, function(item) {
                if (item.views && item.views[id]) {
                    item.views[id].setRootID(id);
                }
            });
        }
        for (var v in this.childViewTypes) {
            if (this.childViewTypes.hasOwnProperty(v)) {
                var child:View = this[v];
                child.setRootID(id);
            }
        }
    }
}
