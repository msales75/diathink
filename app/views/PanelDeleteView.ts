///<reference path="View.ts"/>
m_require("app/views/ImageView.js");

class PanelDeleteView extends ImageView {
    parentView:PanelView;
    isHidden:boolean;
    cssClass = "delete-button";
    init() {
        this.isHidden = true;
        this.isClickable = true;
    }
    value:string = 'theme/images/delete.png';
    updateValue() {
        if (this.panelView.parentView.value.count===1) {
            this.isHidden = true;
        } else {
            this.isHidden = false;
        }
    }
    renderUpdate() {
        this.updateValue();
        if (this.isHidden) {
            this.elem.style.display = 'none';
        } else {
            this.elem.style.display = 'block';
        }
    }
    layoutDown() {
        var p = this.parentView.layout;
        if (!this.layout) {this.layout = {};}
        this.layout.left = p.width-Math.round(1.8*View.fontSize);
            this.layout.width = Math.round(1.5*View.fontSize);
            this.layout.height = Math.round(1.5*View.fontSize);
        this.layout.top = Math.round(0*View.fontSize);
    }
    layoutUp() {

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
        ActionManager.simpleSchedule(View.focusedView,
            function():SubAction {
                return {
                    actionType: PanelCreateAction,
                    name: 'Remove panel',
                    activeID: panel.value.cid,
                    delete: true,
                    panelID: panel.id,
                    focus: false
                };
            });
        /*
        ActionManager.schedule(
            function():SubAction {
                if (!View.focusedView) {return null;}
                return Action.checkTextChange(View.focusedView.header.name.text.id);
            },
            function():SubAction {
                return {
                    actionType: InsertIntoAction,
                    referenceID: panel.value.cid,
                    oldRoot: panel.outline.alist.id,
                    newRoot: panel.outline.alist.id,
                    focus: true
                };
            });
            */
    }
}