
interface ViewList {[name: string]: View}
interface ViewArray {[i: number]: View}
interface ClassArray {[i: number]: any}

class View {
    public static name: string = 'View';
    private static viewList;
    private static nextId:number = 0;
    public static focused:NodeView = null;
    public static hovering:NodeView = null;
    private static getNextId() {
        this.nextId = this.nextId + 1;
        return 'm_' + this.nextId;
    }
    public static childListType: any = null; // default not a list
    public static childSlotTypes: ClassArray = [];
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
    public nodeView:NodeView = null; // node-ancestor if any
    public scrollView:ScrollView = null; // scroll-ancestor if any
    public handleView:HandleView = null; // drag-handle ancestor if any
    public swipeView:SwipeView = null;
    public clickView:View = null; // click-handler ancestor if any
    public onClick:{():any} = null; // click handler interface

    constructor(obj) {
        if ((obj===undefined) || (obj.id === undefined)) {
            this.id = View.getNextId();
        } else { // validate it's not being used
            assert(View.get(obj.id) == null, "Duplicate id specified in view constructor");
        }
        _.extend(this, obj);
        View.viewList[this.id] = this;

        if (this.isTemplate) {
            // if children are not yet instantiated, so instantiate them here
            var childViews = this.Class.childSlotTypes;
            for(var i in childViews) {
                this[childViews[i]] = new this[childViews[i]]({
                    isTemplate: true,
                    parentView: this
                });
            }
        } else {
            for(var i in childViews) {
                this[childViews[i]].parentView = this;
            }
        }
    }
    render() {

    }
    renderUpdate() {

    }
    destroy() {

    }
    renderChildViews() {

    }
    saveContext() {

    }
    validateContext() {

    }
    renderAt() {

    }
    themeChildViews() {

    }
    style() {

    }
    setRootID(id) {

    }
    addClass(name:string) {

    }
    removeClass(name:string) {

    }
}

class NodeView extends View {
    public focus() {}
    public blur() {}
    public header:View;
    public setValueFromDOM() {}
    public themeUpdate() {}

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
// todo: swipe & scroll-wheel
