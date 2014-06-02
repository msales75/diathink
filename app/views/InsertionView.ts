///<reference path="View.ts"/>
m_require("app/views/ImageView.js");

class InsertionView extends ImageView {
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
        this.layout.left = p.width-Math.round(2.5*View.fontSize),
        this.layout.width = Math.round(1.5*View.fontSize),
        this.layout.height = Math.round(1.5*View.fontSize)
    }
    layoutUp() {

    }
    updateValue() {
        if (this.panelView.value.attributes.children.count>0) {
            this.isHidden = true;
        } else {
            this.isHidden = false;
        }
    }
    hide() {
        if (!this.isHidden) {
            this.isHidden = true;
            this.elem.style.display = 'none';
        }
    }
    show() {
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
        ActionManager.schedule(
            function():SubAction {
                if (!View.focusedView) {return null;}
                return Action.checkTextChange(View.focusedView.header.name.text.id);
            },
            function():SubAction {
                return {
                    actionType: InsertIntoAction,
                    name: 'Create first line',
                    referenceID: panel.value.cid,
                    oldRoot: panel.outline.alist.id,
                    newRoot: panel.outline.alist.id,
                    focus: true
                };
            });
    }
    validate() {
        super.validate();
        if (this.panelView.value.attributes.children.count>0) {
            assert(this.isHidden===true, "isHidden is wrong for insertionview");
            assert($(this.elem).css('display')==='none', "Wrong display for insertionview");
        } else {
            assert(this.isHidden===false, "isHidden is wrong for insertionview");
            assert($(this.elem).css('display')==='block', "Wrong display for insertionview");
        }

    }
}