///<reference path="View.ts"/>
m_require("app/views/View.js");

class NodeLinkCountView extends ButtonView {
    parentView:NodeHeaderView;
    cssClass = 'linkcount';
    init() {
        this.isClickable = true;
    }
    numLinks:number= 0;
    buttonContent = '';
    render() {
        super.render();
        if (this.numLinks==0) {
            this.disable();
        }
        return this.elem;
    }

    addLink() {
        ++this.numLinks;
        this.buttonContent = '<div class="numlinks">'+this.numLinks+'</div>';
        var html = '<img src="'+this.value+'" alt="'+this.value+'"/>'+ this.buttonContent;
        this.elem.innerHTML = html;
        this.enable();
    }

    renderUpdate() {
        // this.elem.src = this.value;
    }
    layoutDown() {
        var p = this.parentView.layout;
        this.layout = {
            top: Math.round(.05*View.fontSize),
            left: p.width-Math.round(1.55*View.fontSize),
            width: Math.round(1.5*View.fontSize),
            height: Math.round(1.5*View.fontSize)
        };
    }
    onClick(params:DragStartI) {
        if (this.isEnabled) {
            this.start();
        }
        var collection = new OutlineNodeCollection();
        collection.append('5hc3Qh9gizqM_1197', OutlineNodeModel.getById('5hc3Qh9gizqM_1197'));
        collection.append('5hc3Qh9gizqM_1269', OutlineNodeModel.getById('5hc3Qh9gizqM_1269'));
        collection.append('5hc3Qh9gizqM_1261', OutlineNodeModel.getById('5hc3Qh9gizqM_1261'));

        ActionManager.schedule(
            function():SubAction {
                if (!View.focusedView) {return null;}
                return Action.checkTextChange(View.focusedView.header.name.text.id);
            },
            function():SubAction {
                return {
                    actionType: PanelCreateAction,
                    name: 'Create search panel',
                    activeID: 'search',
                    prevPanel: View.getCurrentPage().content.gridwrapper.grid.listItems.last(),
                    focus: false,
                    searchList: collection
                };
            });
    }
}
