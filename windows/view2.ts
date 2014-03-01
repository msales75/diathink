
interface ViewList {[name: string]: View}
interface ViewArray {[i: number]: View}
interface ClassList {[name: string]: any}

interface ChildLocation {
    parent: {[i:number]:number}; // index-list to the parent-node
    prevChild:string; // name of child with same parent, before this child or null
    offset:number; // number of elements between previous child and this child
}
// can also specify special child-parameters in render()

class View {
    // static variables
    public static type: string = 'View';
    private static viewList;
    private static nextId:number = 0;

    public static focused:NodeView = null;
    public static hovering:NodeView = null;

    public static childSlotTypes: ClassList = {};
    private static childSlotLocations:{[i:number]:ChildLocation};

    public static childListType: any = null; // default not a list
    private static childListLocation:ChildLocation;

    // static functions
    public static get(v:string) {
        return this.viewList[v];
    }
    public static getFromElement(v:HTMLElement) {
        while (!(v.id && this.viewList[v.id]) &&
            v.parentNode &&
            (v !== document.body)) {
            v = <HTMLElement>v.parentNode;
        }
        if (v.id) {return this.viewList[v.id];}
        else {return null;}
    }
    private static getNextId() {
        this.nextId = this.nextId + 1;
        return 'm_' + this.nextId;
    }

    // instance variables
    public Class = View;
    public id:string = null;
    public elem:HTMLElement = null;
    public isView:boolean = true;
    public isTemplate:boolean = false;
    public value:Model = null;
    public isDragHandle:boolean = false;
    public isScrollable:boolean = false;
    public isClickable:boolean = false;
    public childSlots:ViewList = {};
    public childList:ViewArray = null;
    public parentView:View = null;
    public parentContext:string = null; // this view's name in parent's context
    public nodeView:NodeView = null; // node-ancestor if any
    public nodeRootView:NodeRootView = null; // replaces rootID
    public scrollView:ScrollView = null; // scroll-ancestor if any
    public handleView:HandleView = null; // drag-handle ancestor if any
    public swipeView:SwipeView = null;
    public clickView:View = null; // click-handler ancestor if any
    public onClick:{():any} = null; // click handler interface

    constructor(opts:{id?:string;parent?:View; mesg?}) {
        var name:string;
        if (opts.id === undefined) {
            this.id = View.getNextId();
        } else {
            assert(View.get(opts.id) == null,
                "Duplicate id specified in view constructor");
            this.id = opts.id;
        }
        View.viewList[this.id] = this;
        if (opts.parent) {
            this.registerParent(opts.parent);
        }
        // fill childSlots
        var childTypes = this.Class.childSlotTypes;
        for(name in childTypes) {
            assert(!this[name], "Name "+name+" already set in class.");
            this.childSlots[name] = new childTypes[name]({parent:this, mesg:opts.mesg});
        }
        this.render(); // do we want this in constructor?
    }

    private registerParent(parent:View) {
        var C = this.Class;
        this.parentView = parent;
        this.nodeView = C instanceof NodeView ? <NodeView>this : this.parentView.nodeView;
        this.scrollView = C instanceof ScrollView ? <ScrollView>this : this.parentView.nodeView;
        this.handleView = C.isDragHandle ? <HandleView>this : this.parentView.handleView;
        this.nodeRootView = C instanceof NodeRootView ? <NodeRootView>this : this.parentView.nodeRootView;
        this.swipeView = null;
        this.clickView = C.isClickable ? this : this.parentView.clickView;
    }

    render():HTMLElement {assert(false, "Called virtual View::render()"); return null;}

    private insertAt(location:ChildLocation, node:HTMLElement) {
        var C = this.Class;
        var self:View = this;
        var root:HTMLElement = this.elem;
        // todo: insert node at location

    }
    public updateList() {
        var C = this.Class;
        var self:View = this;
        _.each(this.value.models, function(model, i) {
            new C.childListType({
                parentView: self
            });
            // C.childListLocation:ChildLocation;
            // this.childList
            // todo: create list-items
        });
    }

    private renderChildren() {
        var C = this.Class;
        var self:View = this;
        var slotName: string;

        // deal with child-slots
        for (slotName in C.childSlotTypes) {
            this.insertAt(C.childSlotLocations[slotName],
                this.childSlots[slotName].render());
            this.childSlots[slotName].renderChildren();
        }

        // deal with list-items
        if ((C.childListType != null) && (this.value!=null)) {
            this.updateList()
        }
    }

    public replaceChild() {
        // assume child is already rendered
        // call registerParent
    }
    public redraw(opts) {
        // options: skipSlots, skipList, skipSelf
        // redraw entire view -- tricky?
        // must create new DOM entry,
        // re-render all subviews in the new fragment ('re-render')
        // then inject fragment into DOM
        // and preserve focus/hover (call class-update functions?)

        // (or view references?)
        // use replaceChild of parentView.
    }
    public transfer() { // transfer view to a new parentView/parentContext in DOM,
        // without removing any views or DOM elements
    }
    public insertListChild() {
    }
    public removeListChild() {
    }

    destroy() {
        var elem = this.elem;
        if(this.id) {
            if (!elem) {elem = $('#'+this.id)[0];}
            var childViews = this.getChildViewsAsArray();
            for(var i in childViews) {
                if(this[childViews[i]]) {
                    if (elem) {
                        this[childViews[i]].destroy($(elem).find('#'+this[childViews[i]].id)[0]);
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
    }
    renderAt() {
        this.validateContext(context);
        if (context.prev) {
            return $(context.prev).after(this.render());
        } else if (context.next) {
            return $(context.next).before(this.render());
        } else {
            return $(context.parent).prepend(this.render());
        }
    }
    secure(str) {
        return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    validate() {
        // render fresh detached fragment and compare structure
    }
    setRootID(id) {
        if (!id) {id = this.id;}
        if (this.rootID && (this.rootID===this.id) && (this.id!==id)) {
            // do not change RootID if this is a controlled-node
            return;
        }
        this.rootID = id;
        if ((this.type === 'M.ListView')&&(this.value)) {
            var itemlist = this.value[this.items];
            _.each(itemlist, function(item, index) {
                item.setRootID(id);
            });
        }
        var childViewsArray = this.getChildViewsAsArray();
        for (var i in childViewsArray) {
            this[childViewsArray[i]].setRootID(id);
        }
    }
    addClass(name:string) {
        $('#' + this.id).addClass(cssClass);
    }
    removeClass(name:string) {
        $('#' + this.id).removeClass(cssClass);
    }
}

class NodeView extends View {
    public focus() {}
    public blur() {}
    public header:View;
    public setValueFromDOM() {}
    public themeUpdate() {}

}
class NodeRootView extends NodeView {

}

class HandleView extends View {
    public dragStart() {}
}
class ScrollView extends View {
    public scrollStart() {}
}
class SwipeView extends View {
    public swipeStart() {}
}
class TextEditView extends View {

}
// todo: swipe & scroll-wheel
