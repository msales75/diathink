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
interface ViewTypeList {
    [name:string] : any
}
interface ViewList {
    [id:string] : View;
}
interface DragHandleView {
    dragStart():any;
    dragStop();
    dragMove();
}
interface HasList {
    removeListItems();
}
interface PositionI extends JQueryCoordinates {
    top:number;
    left:number;
}
interface Dimensions {
    width:number;
    height:number;
}
declare class NodeModel extends Backbone.Model {
    views:View[];
    children:Backbone.Collection;
}
interface ElemContext {prev:HTMLElement; next:HTMLElement; parent:HTMLElement}
interface GridLayout {cssClass:string; columns: {[i:number]:string} }
class View {
    static nextId:number = 0;
    static viewList:ViewList = {};
    static currentPage:PageView = null;
    static focusedView:NodeView = null;
    static hoveringView:NodeView = null;

    static getNextId():string {
        this.nextId = this.nextId + 1;
        return 'm_' + String(this.nextId);
    }

    static get(id:string) {
        return this.viewList[id];
    }

    public static getFromElement(v:HTMLElement):View {
        while (!(v.id && this.viewList[v.id]) &&
            v.parentNode &&
            (v !== document.body)) {
            v = <HTMLElement>v.parentNode;
        }
        if (v.id && this.viewList[v.id]) {
            return this.viewList[v.id];
        }
        else {return null;}
    }

    public _create(o:{type:string; classes?:string; html?:string}):HTMLElement {
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
    }

    private static register(view) {
        this.viewList[view.id] = view;
    }

    private static unregister(view) {
        delete this.viewList[view.id];
    }

    static getCurrentPage() {
        return this.currentPage;
    }

    static setCurrentPage(page) {
        this.currentPage = page;
    }

    public static setFocus(view:View) {
        var nView:NodeView = null;
        if (view) {
            nView = view.nodeView;
        }
        if (View.focusedView && (nView !== View.focusedView)) {
            if (View.focusedView && View.focusedView.elem && View.focusedView.elem.parentNode) {
                View.focusedView.header.name.text.blur();
            }
        }
        if (nView && (nView !== View.focusedView)) {
            View.focusedView = nView;
            nView.header.name.text.focus();
        } else if (!nView) {
            View.focusedView = null;
        }
    }

    // -- END of static declarations
    public id:string;
    public _name:string;
    public value:any = null;
    public valuePattern:string;
    public Class:any;
    public childViewTypes:ViewTypeList = {};
    public parentView:View = null;
    public cssClass:string = null;
    public elem:HTMLElement = null;
    public isClickable = false;
    public isFocusable = false; // todo: node vs. textarea
    public isDragHandle:boolean = false;
    public isScrollable:boolean = false;
    public isSwipable = false;
    public nodeView:NodeView = null; // node-ancestor if any
    public nodeRootView:OutlineRootView = null; // replaces rootID
    public scrollView:ScrollView = null; // scroll-ancestor if any
    public handleView:HandleImageView = null; // drag-handle ancestor if any
    public panelView:PanelView = null;
    public clickView:View = null; // click-handler ancestor if any
    // public swipeView:SwipeView = null;
    listItemTemplateView:any;
    listItems:View[];
    hideList:boolean;
    public items:string = 'models'; // eliminate
    // droppable is defined in view.dropboxes
    public dropboxes = []; // places to drop objects in drag-mode
    constructor(opts:{id?:string;parentView?:View; value?:any; hideList?:boolean; mesg?}) {
        if ((opts == null) || (opts.id == null)) {
            this.id = View.getNextId();
            delete opts['id'];
        } else { // validate it's not being used
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

    createListItems() {
        // check they shouldn't already exist
        assert((!this.elem) || (this.elem.children.length === 0),
            "createListItems has children when creating more");
        if (this.value instanceof Backbone.Collection) {
            this.listItems = [];
            if (!this.hideList) {
                // ensure you don't render ones that are collapsed
                var models = (<Backbone.Collection>(this.value)).models;
                for (var i = 0; i < models.length; ++i) {
                    this.listItems.push(new this.listItemTemplateView({
                        parentView: this,
                        value: models[i]
                    }));
                }
            }
        }
    }

    private registerParent(parent:View) {
        var C = this.Class;
        this.parentView = parent;
        this.nodeView = this instanceof NodeView ? <NodeView>this : parent.nodeView;
        this.scrollView = this instanceof ScrollView ? <ScrollView>this : parent.scrollView;
        this.panelView = this instanceof PanelView ? <PanelView>this : parent.panelView;
        this.handleView = this instanceof HandleImageView ? <HandleImageView>this : parent.handleView;
        this.nodeRootView = this instanceof OutlineRootView ? <OutlineRootView>this : parent.nodeRootView;
        this.clickView = this.isClickable ? this : this.parentView.clickView;
        //this.swipeView = null;
    }

    init() {} // override with appropriate types
    updateValue() {}

    removeListItems() {} // if can be a list
    themeFirst() {} // only if can be in a list
    themeLast() {} // only if can be in a list
    onClick() {}

    onDoubleClick() {}

    render():HTMLElement {return this.elem;}

    destroy():any {
        var elem = this.elem;
        if (this.nodeRootView && this.value && this.value.clearView) {
            this.value.clearView(this.nodeRootView); // remove view from model-outline
        }
        for (var v in this.childViewTypes) {
            if (this.childViewTypes.hasOwnProperty(v)) {
                var child:View = this[v];
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
    }

    renderChildViews() {
        for (var v in this.childViewTypes) {
            if (this.childViewTypes.hasOwnProperty(v)) {
                var child:View = this[v];
                assert(child != null,
                    'There is no child view \'' + v + '\' available for (' +
                        (this._name ? this._name + ', ' : '') + '#' + this.id +
                        ')! It will be excluded from the child views and won\'t be rendered.');
                if (child) {
                    assert(child.elem === null,
                        "Rendering item with elem not null");
                    child.render();
                }
            }
        }
    }

    renderListItems() {
        for (var i = 0; i < this.listItems.length; ++i) {
            var li:View = this.listItems[i];
            assert(li.elem === null,
                "Rendering item with elem not null");
            li.render();
            // post-rendering modifications, based on knowledge of list-placement
            if (i === 0) {
                li.themeFirst();
            }
            if (i === this.value.models.length - 1) {
                li.themeLast();
            }
        }
    }

    setValuePatterns(model):void {
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

    saveContext():ElemContext {
        var elem = this.elem;
        return {
            prev: <HTMLElement>(elem.previousSibling),
            next: <HTMLElement>(elem.nextSibling),
            parent: <HTMLElement>(elem.parentNode)
        };
    }

    validateContext(context):void {
        assert(context.parent, '');
        if (context.prev) {
            assert(context.prev.parentNode === context.parent, '');
            assert(context.prev.nextSibling === context.next, '');
        }
        if (context.next) {
            assert(context.next.parentNode === context.parent, '');
            assert(context.next.previousSibling === context.prev, '');
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

    secure(str:string):string {
        return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    addClass(value:string):View {
        // todo: simplify because we can retain class in list-form in View.
        var classes, elem, cur, clazz, j;
        classes = ( value || "" ).match(/\S+/g) || [];
        elem = this.elem;
        cur = elem.nodeType === 1 && ( elem.className ?
            ( " " + elem.className + " " ).replace(/[\t\r\n]/g, " ") :
            " "
            );
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
    }

    removeClass(value:string):View {
        var classes, elem, cur, clazz, j;
        classes = ( value || "" ).match(/\S+/g) || [];
        elem = this.elem;
        cur = elem.nodeType === 1 && ( elem.className ?
            ( " " + elem.className + " " ).replace(/[\t\r\n]/g, " ") :
            ""
            );
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
    }

    // set rootID for all list-items within this list, recursively
    setRootID(view) {
        assert(view instanceof View, "Invalid view for setRootID");
        var id = view.id;
        if ((this.nodeRootView === this) && (this !== view)) {
            // do not change RootID if this is a controlled-node
            return;
        }
        this.nodeRootView = view;
        if ((this instanceof ListView) && (this.value)) {
            var itemlist = this.value[this.items];
            _.each(itemlist, function(item:NodeModel) {
                if (item.views && item.views[id]) {
                    item.views[id].setRootID(view);
                }
            });
        }
        for (var v in this.childViewTypes) {
            if (this.childViewTypes.hasOwnProperty(v)) {
                var child:View = this[v];
                child.setRootID(view);
            }
        }
    }
}
