///<reference path="View.ts"/>

m_require("app/views/ImageView.js");

class NewRoomView extends ImageView {
    parentView:PanelView;
    isHidden:boolean;
    cssClass = "insertion-button";
    init() {
        this.isHidden = true;
        this.isClickable = true;
    }
    value:string = 'theme/images/plus.png';
    layoutDown() {
        var p = this.parentView.layout;
        if (!this.layout) {this.layout = {};}
        this.layout.left = Math.round(View.fontSize),
        this.layout.width = Math.round(1.5*View.fontSize),
        this.layout.height = Math.round(1.5*View.fontSize)
    }
    updateValue() {
        if (this.panelView.value && (this.panelView.value.attributes.text==='Browse')) {
            this.isHidden = false;
        } else {
            this.isHidden = true;
        }
    }
    hide() {
        if (!this.isHidden) {
            this.isHidden = true;
            this.elem.style.display = 'none';
        }
    }
    show() {
        if (this.panelView.value && (this.panelView.value.attributes.owner!==$D.userID)) {
            return; // can't show without permissions
        }
        if (this.isHidden) {
            this.isHidden = false;
            this.elem.style.display = 'block';
        }
    }
    render() {
        super.render();
        this.elem.style.zIndex = '1'; // in front of outline
        if (this.isHidden) {
            this.elem.style.display = 'none';
        } else {
            this.elem.style.display = 'block';
        }
        return this.elem;
    }
    onClick(params:DragStartI) {
        if (!this.panelView) {return;}
        var that = this;
        var panel = this.panelView;
        var lastID = View.get(panel.outline.alist.listItems.last()).value.cid;
        var str = '(   1/   0) ';
        this.hide();
        ActionManager.schedule(
            function():SubAction {
                if (!View.focusedView) {return null;}
                return Action.checkTextChange(View.focusedView.header.name.text.id);
            },
            function():SubAction {
                return {
                    actionType: InsertAfterAction,
                    name: 'Append room',
                    referenceID: lastID,
                    oldRoot: panel.outline.alist.id,
                    newRoot: panel.outline.alist.id,
                    text: str,
                    focus: true,
                    cursor: [str.length, str.length]
                };
            }, function() {
                var newID = View.get(panel.outline.alist.listItems.last()).value.cid;
                return {
                    actionType:InsertIntoAction,
                    name: 'Create room outline',
                    referenceID:newID,
                    oldRoot:panel.outline.alist.id,
                    newRoot:panel.outline.alist.id,
                    text: 'Outline',
                    focus: false
                }
            }, function() {
                var newID = View.get(panel.outline.alist.listItems.last()).value.cid;
                return {
                    actionType: MoveIntoAction,
                    name: 'Transfer room chat',
                    activeID: 'chatroot',
                    referenceID: newID,
                    focus: false
                }
            }
        );
        // create two children for this node

    }
    validate() {
        super.validate();
        if ((this.panelView.value==null)||(this.panelView.value.attributes.children.count>0)||(this.panelView.value.attributes.owner!==$D.userID)) {
            assert(this.isHidden===true, "isHidden is wrong for insertionview");
            assert($(this.elem).css('display')==='none', "Wrong display for insertionview");
        } else {
            assert(this.isHidden===false, "isHidden is wrong for insertionview");
            assert($(this.elem).css('display')==='block', "Wrong display for insertionview");
        }

    }
}