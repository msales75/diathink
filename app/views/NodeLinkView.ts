///<reference path="View.ts"/>
m_require("app/views/View.js");

class NodeLinkView extends View {
    parentView:NodeTextWrapperView;
    value:OutlineNodeModel;
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
        if (!this.layout) {this.layout = {};}
        this.layout.top = offset.top+Math.round(.15*View.fontSize);
        this.layout.left= offset.left+Math.round(.18*View.fontSize);
        $(this.elem).css({
            top: String(this.layout.top)+'px',
            left: String(this.layout.left)+'px'
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