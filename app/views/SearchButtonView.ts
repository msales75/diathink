///<reference path="View.ts"/>
m_require("app/views/ButtonView.js");
class SearchButtonView extends ButtonView {
    parentView:HeaderToolbarView;
    value:string = 'theme/images/search.png';
    init() {
        this.isClickable = true;
    }
    onClick(params:DragStartI) {
        if (this.isEnabled) {
            this.start();
        }
        var collection = new OutlineNodeCollection();
        collection.append('j7oV1V6W8M26_490', OutlineNodeModel.getById('j7oV1V6W8M26_490'));

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
    suggest() {
        this.value = 'theme/images/search-1.png';
        this.elem.innerHTML = '<img src="'+this.value+'" alt="'+this.value+'"/>';
    }
    layoutDown() {
        this.layout = {
            top: 4,
            left: this.parentView.layout.width-105-36-5,
            width: 36,
            height: 36
        };
    }
    cssClass = 'undo-button';
}

