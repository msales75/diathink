///<reference path="../../frameworks/m.ts"/>
///<reference path="BreadcrumbView.ts"/>
///<reference path="ButtonView.ts"/>
///<reference path="ContainerView.ts"/>
///<reference path="DiathinkView.ts"/>
///<reference path="DrawLayerView.ts"/>
///<reference path="DropLayerView.ts"/>
///<reference path="GridView.ts"/>
///<reference path="GridContainerView.ts"/>
///<reference path="HandleImageView.ts"/>
///<reference path="HeaderTitleView.ts"/>
///<reference path="HeaderToolbarView.ts"/>
///<reference path="HiddenDivView.ts"/>
///<reference path="ImageView.ts"/>
///<reference path="InsertionView.ts"/>
///<reference path="LeftSwipeButtonView.ts"/>
///<reference path="ListItemView.ts"/>
///<reference path="ListView.ts"/>
///<reference path="LoaderView.ts"/>
///<reference path="NodeHeaderView.ts"/>
///<reference path="NodeTextView.ts"/>
///<reference path="NodeTextWrapperView.ts"/>
///<reference path="NodeView.ts"/>
///<reference path="LinkListView.ts"/>
///<reference path="NodeLinkView.ts"/>
///<reference path="OutlineListView.ts"/>
///<reference path="OutlineRootView.ts"/>
///<reference path="OutlineScrollView.ts"/>
///<reference path="PageContentView.ts"/>
///<reference path="PageView.ts"/>
///<reference path="PanelGridView.ts"/>
///<reference path="PanelView.ts"/>
///<reference path="PanelDeleteView.ts"/>
///<reference path="RedoButtonView.ts"/>
///<reference path="RightSwipeButtonView.ts"/>
///<reference path="ScrollSpacerView.ts"/>
///<reference path="ScrollView.ts"/>
///<reference path="SpanView.ts"/>
///<reference path="TextAreaView.ts"/>
///<reference path="ToolbarView.ts"/>
///<reference path="UndoButtonContainerView.ts"/>
///<reference path="UndoButtonView.ts"/>
///<reference path="DropBox.ts"/>
///<reference path="../models/OutlineNodeModel.ts"/>
///<reference path="../LinkedList.ts"/>
interface JQueryEventObjectD extends JQueryEventObject {
    simulated:boolean;
}
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
interface Layout {
    top?: number;
    left?:number;
    width?:number;
    height?:number;
    relative?:View;
}
interface PositionI extends JQueryCoordinates {
    top:number;
    left:number;
}
interface Dimensions {
    width:number;
    height:number;
}
interface ElemContext {prev:HTMLElement; next:HTMLElement; parent:HTMLElement}
interface GridLayout {cssClass:string; columns: {[i:number]:string} }
class DeadView {
    static viewList:{[i:string]:DeadView} = {};
    id:string;
    parent:string;
    value:any;

    constructor(view:View) {
        assert(DeadView.viewList[view.id] === undefined, "Same view ID sent to graveyard twice");
        DeadView.viewList[view.id] = this;
        this.id = view.id;
        this.parent = view.parentView.id;
        this.value = view.value;
    }

    getOptions() {
        return {
            id: this.id,
            parentView: View.get(this.parent),
            value: this.value
        }
    }

    resurrect():View {
        delete DeadView.viewList[this.id];
        return new View(this.getOptions());
    } // override with type of view
    validate() {
        assert(View.viewList[this.id] === undefined,
            "View " + this.id + " is dead and alive");
        assert((View.viewList[this.parent] instanceof View) ||
            (DeadView.viewList[this.parent] instanceof DeadView),
            "DeadView " + this.id + " parent is neither dead nor alive");
    }
}
class View {
    static nextId:number = 0;
    static viewList:ViewList = {};
    static graveyard:{[i:string]:DeadView};
    static currentPage:DiathinkView = null;
    static focusedView:NodeView = null;
    static hoveringView:NodeView = null;
    static fontSize = 16;

    static escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    static getNextId():string {
        this.nextId = this.nextId + 1;
        return 'm_' + String(this.nextId);
    }

    static get(id:string):View {
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
        // console.log("Inside setFocus with view " + view.id);
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
            // console.log("Setting focus to node " + nView.id);
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
    public layout:Layout;
    public isAbsolute:boolean = true;
    public childOpts:{[name:string]:any} = {}; // options for children
    public childViewTypes:ViewTypeList = {};
    public parentView:View = null;
    public cssClass:string = null;
    public elem:HTMLElement = null;
    public isClickable:boolean = false;
    public lastClicked:number; // for clickable items
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
    listItemTemplate:typeof View;
    listTemplate:typeof LinkedList;
    listItems:LinkedList<View>;
    hideList:boolean;
    public items:string = 'models'; // eliminate
    // droppable is defined in view.dropboxes
    public dropboxes:DropBox[] = []; // places to drop objects in drag-mode
    constructor(opts:{id?:string;parentView?:View; value?:any; hideList?:boolean; mesg?; childOpts?:{};parentPanel?:PanelView}) {
        var that = this;
        (function defineThisID() {
        if ((opts == null) || (opts.id == null)) {
            that.id = View.getNextId();
            delete opts['id'];
        } else { // validate it's not being used
            assert(View.get(opts.id) == null, "Duplicate id specified in view constructor");
            // check if we should use a resurrected view instead
            if (DeadView.viewList[opts.id] !== undefined) { // use resurrected view
                if (opts.parentView !== undefined) {
                    assert(opts.parentView.id === DeadView.viewList[opts.id].parent,
                        "Resurrection of " + opts.id + " doesn't match parent");
                }
                if (opts.value !== undefined) {
                    assert(opts.value === DeadView.viewList[opts.id].value,
                        "Resurrection of " + opts.id + " doesn't match value");
                }
                assert(opts.childOpts === undefined,
                    "Cannot use childOpts on a resurrected view " + opts.id);
                _.extend(opts, DeadView.viewList[opts.id].getOptions());
                delete DeadView.viewList[opts.id];
            }
            that.id = opts.id;
        }
        })();
        this.init();
        (function extendAndRegister() {
            _.extend(that, opts);
            View.register(that);
            if (!(that instanceof PageView)) {
                assert(that.parentView instanceof View,
                    "Cannot instantiate object " + that.id + " without parentView");
            }
            if (opts.parentView !== undefined) {
                that.registerParent(opts.parentView);
            }
        })();
        // initial parentView is used for calculating value.
        // Value updates from parent-changes have to be propagated manually.
        this.updateValue();
        this.layoutDown();
        (function creatingListItems() {
            if (that.value instanceof LinkedList) {
                that.listItems = new LinkedList<View>();
            }
            that.createListItems();
        })();
        (function createChildren() {
            for (var v in that.childViewTypes) {
                if (that.childViewTypes.hasOwnProperty(v)) {
                    var childOpts = {_name: v, parentView: that};
                    if (that.childOpts && that.childOpts[v]) {
                        _.extend(childOpts, that.childOpts[v]);
                    }
                    that[v] = new that.childViewTypes[v](childOpts);
                }
            }
        })();
        return this;
    }

    setPosition() {
        this.layoutUp();
        if (this.elem && this.layout) {
            if (this instanceof PageView) {
                $(this.elem).css('position', 'fixed');
            } else if (this.isAbsolute) {
                $(this.elem).css('position', 'absolute');
            } else {
                $(this.elem).css('position', 'relative');
            }
            if (this.layout.left != null) {
                $(this.elem).css('left', this.layout.left + 'px');
            }
            if (this.layout.top != null) {
                $(this.elem).css('top', this.layout.top + 'px');
            }
            if (this.layout.width != null) {
                $(this.elem).css('width', this.layout.width + 'px');
            }
            if (this.layout.height != null) {
                $(this.elem).css('height', this.layout.height + 'px');
            }
        }
    }

    createListItems() {
        // check they shouldn't already exist
        if (_.size(this.childViewTypes) === 0) {
            assert((!this.elem) || (this.elem.children.length === 0),
                "createListItems has children when creating more");
        }
        if (this.value instanceof LinkedList) {
            this.listItems.reset();
            if (!this.hideList) { // collapsed list
                var models = (<LinkedList<PModel>>(this.value));
                var m:string;
                for (m = models.first(); m !== ''; m = models.next[m]) {
                    var view = new this.listItemTemplate({
                        parentView: this,
                        value: models.obj[m]
                    });
                    this.listItems.append(view.id, view);
                }
            }
        }
    }

    changeParent(parent:View) {
        this.registerParent(parent);
        var v:string;
        for (v in this.childViewTypes) {
            if (this[v] != null) {
                this[v].changeParent(this);
            }
        }
        if (this.listItems != null) {
            for (v in this.listItems.obj) {
                if (this.listItems.obj[v] != null) {
                    this.listItems.obj[v].changeParent(this);
                }
            }
        }
    }

    registerParent(parent:View, deep?:boolean) {
        this.parentView = parent;
        this.nodeView = this instanceof NodeView ? <NodeView>this : parent.nodeView;
        this.scrollView = this instanceof ScrollView ? <ScrollView>this : parent.scrollView;
        this.panelView = this instanceof PanelView ? <PanelView>this : parent.panelView;
        this.handleView = this instanceof HandleImageView ? <HandleImageView>this : parent.handleView;
        this.nodeRootView = this instanceof OutlineRootView ? <OutlineRootView>this : parent.nodeRootView;
        this.clickView = this.isClickable ? this : this.parentView.clickView;
        // this.swipeView = null;
    }

    init() {} // override with appropriate types
    updateValue() {}

    themeFirst(b:boolean) {} // only if can be in a list
    themeLast(b:boolean) {} // only if can be in a list
    onClick(params:DragStartI) {}

    removeFromModel() {}

    onDoubleClick(params:DragStartI) {}

    detach(v:View, opts?:any) { // override in listviews to remove item from list
        if ((v.parentView === this) && v.elem && v.elem.parentNode) {
            v.elem.parentNode.removeChild(v.elem);
        }
    }

    render():HTMLElement {return this.elem;}

    destroy(opts?):any {
        var elem = this.elem;
        // detach from parent-view
        if (this.parentView) {
            this.parentView.detach(this, opts);
            this.elem = null;
        }
        // remove any references from model to this view
        this.removeFromModel();
        for (var v in this.childViewTypes) {
            if (this.childViewTypes.hasOwnProperty(v)) {
                var child:View = this[v];
                if (child) {
                    child.destroy();
                }
            }
        }
        if (this.listItems != null) {
            this.removeListItems();
        }
        View.unregister(this);
    }

    renderChildViews() {
        var v:string, child:View;
        for (v in this.childViewTypes) {
            if (this.childViewTypes.hasOwnProperty(v)) {
                child = this[v];
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
        var items = this.listItems;
        var m:string;
        for (m = items.first(); m !== ''; m = items.next[m]) {
            var li:View = items.obj[m];
            assert(li.elem === null,
                "Rendering item with elem not null");
            li.render();
            // post-rendering modifications, based on knowledge of list-placement
            li.themeFirst(items.prev[m] === '');
            li.themeLast(items.next[m] === '');
        }
        this.positionChildren(null);
    }

    insertListItems() {
        if (this.listItems && this.listItems.count) {
            this.renderListItems();
            var items = this.listItems;
            for (var m = items.first(); m !== ''; m = items.next[m]) {
                this.elem.appendChild(items.obj[m].elem);
            }
            // this.listItems = null; // done with temporary storage
        }
    }

    removeListItems() {
        var id:string;
        var elem:HTMLElement = this.elem;
        assert(this.listItems instanceof LinkedList, "listITems is not a linked list");
        for (id in this.listItems.obj) {
            View.get(id).destroy({destroyList: true});
        }
        this.listItems.reset();
        assert(this.listItems.count === 0,
            "listItems is nonempty after removing all children");
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
            _.each(itemlist, function(item:OutlineNodeModel) {
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

    saveLayout() {
        var k:string;
        var temp:Layout = {};
        if (!this.layout) {return temp;}
        for (k in this.layout) {
            temp[k] = this.layout[k];
        }
        return temp;
    }

    updateDiffs(l1:Layout) {
        if (!l1 || !this.layout || !this.elem) {return;}
        var diffs:Layout = {};
        var k:string;
        for (k in this.layout) {
            if (this.layout[k] !== l1[k]) {
                $(this.elem).css(k, String(this.layout[k]) + 'px');
            }
        }
    }

    getOffset():{top?:number;left?:number} {
        if (!this.parentView) {
            return {top: this.layout.top, left: this.layout.left}
        }
        var pos = this.parentView.getOffset();
        return {
            top: pos.top + this.layout.top,
            left: pos.left + this.layout.left
        };
    }

    layoutDown() {}

    layoutUp() {}

    positionChildren(v:View, v2?:string) {}

    resize() {
        var tempLayout:Layout = this.saveLayout();
        this.layoutDown();
        var c:string;
        for (c in this.childViewTypes) {
            this[c].resize();
        }
        if (this.listItems) {
            var l:string;
            var list = this.listItems;
            for (l = list.first(); l !== ''; l = list.next[l]) {
                list.obj[l].resize();
            }
        }
        this.positionChildren(null);
        this.layoutUp();
        this.updateDiffs(tempLayout);
    }

    resizeUp(opts?:{top?:string;end?:string}) {
        if (this instanceof NodeTextView) {
            if (!$D.resizeCount) {$D.resizeCount=0;}
            ++$D.resizeCount;
            if ($D.resizeCount % 2 == 0) {
               //  console.log("Even count");
            } else {
                // console.log("Odd count");
            }
            // console.log("calling resizeUp for view "+this.id);
        }
        var topView:NodeView;
        // check if this is the list containing opts.top, which halts recursion
        if (opts && opts.top && (this.nodeRootView!=null)) {
            // assert(this.nodeRootView != null, "Cannot call resizeUP with options outside outline");
            var topView = OutlineNodeModel.getById(opts.top).views[this.nodeRootView.id];
            // topView can be null if one panel is using top/end and another has them out of scope
            if ((topView!=null)&&(topView.parentView === this)) { // go no further, return without calling resizeUP again.
                if (opts.end != null) {
                    var endView:NodeView = OutlineNodeModel.getById(opts.end).views[this.nodeRootView.id];
                    this.positionChildren(topView, endView.id);
                    //console.log('resizeUp 1');
                } else {
                    //console.log('resizeUp 2');
                }
                return;
            }
        }
        //console.log('resizeUp 3');
        var tempLayout:Layout = this.saveLayout();
        this.positionChildren(null); // todo: could just position later ones
        this.layoutUp();
        if (this.parentView) {
            //console.log('resizeUp 4');
            var tl = this.layout;
            //if ((tl.height!==tempLayout.height)||(tl.width!==tempLayout.width)||
            //    (tl.top!==tempLayout.top)||(tl.left!==tempLayout.left)) {
                this.parentView.resizeUp(opts);
            //}
        } else {
            //console.log('resizeUp 5');
        }
        this.updateDiffs(tempLayout);
    }

    validate() {
        // validate that its registered with the corresponding view-list
        var views:{[k:string]:View} = View.viewList;
        var panels:{[i:string]:PanelView} = PanelView.panelsById;
        var outlines:{[i:string]:OutlineRootView} = OutlineRootView.outlinesById;
        var nodes:{[i:string]:NodeView} = NodeView.nodesById;
        var pageID:string = View.currentPage.id;
        var v = this.id;
        var n:number, pname:string;
        assert(views[v] === this,
            "View " + v + " does not have a valid id");
        // Validate child views & ancestry
        var cViews:{[k:string]:View} = {}, cViewsI = null;
        var k:string;
        for (k in this.childViewTypes) {
            cViews[k] = this[k];
        }
        if (cViews != null) {
            for (k in cViews) {
                assert(cViews[k] instanceof View,
                    "childview " + k + " of view " + v + " is not a View");
                assert(cViews[k] instanceof this.childViewTypes[k],
                    "childview " + k + " of view " + v + " has wrong type");
                if (cViews[k] != null) { // allow empty child-views
                    assert(cViews[k].id != null,
                        "childView " + k + " of view " + v + " does not have a valid id");
                    assert(views[cViews[k].id] === cViews[k],
                        "childView " + k + " with id=" + cViews[k].id + " under parent " + v +
                            " is not in the views list");
                    assert(cViews[k].parentView === this,
                        "childView " + k + " with id=" + cViews[k].id + " under parent " + v +
                            " does not have matching parentView");
                }
            }
        }
        if (this.listItems != null) {
            assert(this.listItems instanceof LinkedList,
                "Parent ListView " + this.id + " has listItems that's not a Linked List");
            this.listItems.validate();
            assert(this.value instanceof LinkedList, "View " + v + " has listItems but does not have list for value");
            this.value.validate();
            for (k in this.listItems.obj) {
                assert(this.listItems.obj[k] instanceof this.listItemTemplate,
                    "Parent List " + this.id + " has a listItem " + k + " that is not matching listItemTemplate");
                assert(views[k] === this.listItems.obj[k], "View is not defined for child " + k + " of parent " + this.id);
                assert(views[k].parentView === this,
                    "Parent list " + this.id + " has listItem " + k + " without matching parentView");
            }
            if (_.size(this.childViewTypes) === 0) { // if there are no other elements in the list
                assert(this.elem.children.length === this.listItems.count,
                    "Wrong number of DOM children for list " + this.id);
                for (var n = 0, pname = this.listItems.first(); pname !== ''; pname = this.listItems.next[pname], ++n) {
                    assert(this.elem.children[n] === (<View>this.listItems.obj[pname]).elem,
                        "DOM List child " + n + " does not match id=" + pname);
                }
            } else {
                // todo: validate DOM when list mixed with regular children
            }
        }
        if (this !== View.currentPage) {
            assert(this.parentView != null,
                "View " + v + " has no parentView");
        }
        if (this.parentView != null) {
            assert(this.parentView instanceof View,
                "View " + v + " has a parentView that's not a View");
            assert(views[this.parentView.id] === this.parentView,
                "View " + v + " has a parentView that is not in the view-list");
            var pV:View = this.parentView;
            var parents:string[] = [v];
            var pgt:string = pV.id;
            while (pgt && (pgt !== pageID) && (!_.contains(parents, pgt))) {
                parents.push(pgt);
                pgt = views[pgt].parentView.id;
            }
            assert(pgt === pageID,
                "View " + v + " does not have ancestry to a page");
            // (proves each page's parent-tree is connected & acyclic)
            // prove the child-list includes all views claiming this as a parent
            var foundit:boolean = false;
            if (pV.listItems != null) {
                for (k in pV.listItems.obj) {
                    if (views[k] === this) {
                        foundit = true;
                        break;
                    }
                }
            }
            cViews = {};
            for (var name in pV.childViewTypes) {
                if (pV[name] === this) {
                    foundit = true;
                    break;
                }
            }
            assert(foundit,
                "View " + v + " has parent " + pV.id + " but none of parent's children reference " + v);
            // validate parent-inheritance of context-references
            if (!(this instanceof NodeView)) {
                assert(this.nodeView === this.parentView.nodeView,
                    "View " + v + " does not match its parents nodeView");
            }
            if (!(this instanceof OutlineScrollView)) {
                assert(this.scrollView === this.parentView.scrollView,
                    "View " + v + " does not match its parents scrollView");
            }
            if (!(this instanceof PanelView)) {
                assert(this.panelView === this.parentView.panelView,
                    "View " + v + " does not match its parents panelView");
            }
            if (!(this instanceof HandleImageView)) {
                assert(this.handleView === this.parentView.handleView,
                    "View " + v + " does not match its parents handleView");
            }
            if (!(this instanceof OutlineRootView)) {
                assert(this.nodeRootView === this.parentView.nodeRootView,
                    "View " + v + " does not match its parents nodeRootView");
            }
            if (this.isClickable) {
                assert(this.clickView === this,
                    "View " + v + " is a clickView that doesn't know it");
            } else {
                assert(this.clickView === this.parentView.clickView,
                    "View " + v + " does not match its parents clickView");
            }
            // Confirm that view-parent is a DOM parent
            assert($(this.elem).parents('#' + this.parentView.id).length === 1,
                "View " + v + " does not have parent-view " + this.parentView.id);
        }
        assert(this.elem != null,
            "View " + v + " has no element");
        assert(this.elem instanceof HTMLElement,
            "View " + v + " has no valid element");
        assert(this.id === this.elem.id,
            "Element for view " + v + " has wrong id");
        assert($('#' + this.elem.id).length === 1,
            "Element for views " + v + " not found in DOM");
        if ($(this.elem).css('display') !== 'none') {
            var offset = $(this.elem).offset();
            var offset2 = this.getOffset();
            assert(Math.abs(offset.top - offset2.top) <= 1, "Offset tops don't match for view " + this.id);
            assert(Math.abs(offset.left - offset2.left) <= 1, "Offset lefts don't match for view " + this.id);
            if (this.layout.width != null) {
                assert(Math.abs(this.layout.width - this.elem.clientWidth) <= 1, "Widths don't match for " + this.id);
            } else {
                console.log("Notice: missing width for view " + this.id);
            }
            if (this.layout.height != null) {
                assert(Math.abs(this.layout.height - this.elem.clientHeight) <= 1, "Heights don't match for " + this.id);
            } else {
                console.log("Notice: missing height for view " + this.id);
            }
        }
    }
}
