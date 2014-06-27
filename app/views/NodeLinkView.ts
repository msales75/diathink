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
            var words = value.split(' ');
            if (words.length<2) {
                return '[' + value + ']';
            } else {
                if (words[0].length>7) {
                    return '[' + words[0] + '..]';
                } else {
                    if (words.length>2) {
                        return '[' + words[0] + ' ' + words[1] + '..]';
                    } else {
                        return '[' + value + ']';
                    }
                }
            }
        }
    }

    render():HTMLElement {
        this._create({
            type: 'div',
            classes: 'node-link',
            html: this.getText()
        });
        return this.elem;
    }

    setOffset(offset) {
        if (!this.layout) {this.layout = {};}
        this.layout.top = offset.top + Math.round(.15 * View.fontSize);
        this.layout.left = offset.left + Math.round(.18 * View.fontSize);
        $(this.elem).css({
            top: String(this.layout.top) + 'px',
            left: String(this.layout.left) + 'px'
        });
    }

    onClick(params:DragStartI) {
        var that = this;
        if (this.panelView.childPanel != null) {
            // change-root child panel
            ActionManager.simpleSchedule(View.focusedView,
                function():SubAction {
                    if (that.panelView.childPanel.value === that.value) {
                        return {
                            actionType: PanelCreateAction,
                            name: 'Close link panel',
                            delete: true, // prevPanel is the parent
                            activeID: that.value.cid,
                            prevPanel: that.panelView.id,
                            panelID: that.panelView.childPanel.id,
                            focus: false
                        };
                    } else {
                        return {
                            actionType: PanelRootAction,
                            name: 'Update link panel',
                            activeID: that.value.cid,
                            oldRoot: that.panelView.childPanel.outline.alist.nodeRootView.id,
                            newRoot: 'new'
                        };
                    }
                });
        } else {
            ActionManager.simpleSchedule(View.focusedView,
                function():SubAction {
                    return {
                        actionType: PanelCreateAction,
                        name: 'Open link panel',
                        isSubpanel: true, // prevPanel is the parent
                        activeID: that.value.attributes.parent.cid,
                        prevPanel: that.panelView.id,
                        oldRoot: that.nodeRootView.id,
                        newRoot: 'new',
                        focus: true,
                        focusID: that.value.cid
                    };
                });
        }
    }

    onDoubleClick(params:DragStartI) {
        // delete link, possibly closing other panel
        // check if next-panel is a child
        if (this.nodeView.readOnly) {return;}
        var that = this;
        var panel = this.panelView;
        ActionManager.simpleSchedule(View.focusedView,
            function():SubAction {
                if (panel.childPanel == null) {
                    return {
                        actionType: AddLinkAction,
                        name: 'Remove link',
                        delete: true,
                        activeID: that.value.cid,
                        referenceID: that.nodeView.value.cid,
                        focus: false
                    };
                } else {
                    return null;
                }
            });
    }
}