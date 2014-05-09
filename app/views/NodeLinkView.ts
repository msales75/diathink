///<reference path="View.ts"/>
m_require("app/views/View.js");

class NodeLinkView extends View {
    parentView:NodeTextWrapperView;
    value:OutlineNodeModel;
    top:number;
    left:number;
    init() {
        this.isClickable = true;
    }
    getText():string {
        var value = String(this.value.get('text'));
        if (value.match(/[a-zA-Z0-9_\-]/) == null) {
            return '[Link]'
        } else {
            return '['+value+']';
        }
    }

    render():HTMLElement {
        this._create({
            type:'div',
            classes: 'node-link',
            html: this.getText()
        });
        return this.elem;
    }
    setOffset(offset) {
        this.top = offset.top;
        this.left= offset.left;
        if (this.parentView.textOffset.left===undefined) {
            this.parentView.resize();
        }
        $(this.elem).css({
            top: String(this.top+this.parentView.textOffset.top)+'px',
            left: String(this.left+this.parentView.textOffset.left)+'px'
        });
    }
    onClick() {
        var that = this;
        if (this.panelView.childPanel!=null) {
            // change-root child panel

            ActionManager.simpleSchedule(View.focusedView,
                function():SubAction {
                    return {
                        actionType: PanelRootAction,
                        activeID: that.value.cid,
                        oldRoot: that.panelView.childPanel.outline.alist.nodeRootView.id,
                        newRoot: 'new'
                    };
                });
        } else {
            ActionManager.simpleSchedule(View.focusedView,
                function():SubAction {
                    return {
                        actionType: PanelCreateAction,
                        isSubpanel: true, // prevPanel is the parent
                        activeID: that.value.cid,
                        prevPanel: that.panelView.id,
                        oldRoot: that.nodeRootView.id,
                        newRoot: 'new',
                        focus: false
                    };
                });
        }
    }
}