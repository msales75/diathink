///<reference path="View.ts"/>
m_require("app/views/View.js");
class ListView extends View {
    value:Backbone.Collection;

    render() {
        var classes = 'ui-listview ui-listview-inset ui-corner-all ui-shadow ui-listview-c ' +
            (this.cssClass ? this.cssClass : '');
        assert(this.elem == null, "Rendering a list that already exists");
        this._create({
            type: 'ul',
            classes: classes
        });
        this.insertListItems();
        return this.elem;
    }

    insertListItems() {
        if (this.listItems && this.listItems.length) {
            this.renderListItems();
            for (var i = 0; i < this.listItems.length; ++i) {
                this.elem.appendChild(this.listItems[i].elem);
            }
            this.listItems = null; // done with temporary storage
        }
    }
    removeListItems() {
        var i;
        var elem:HTMLElement = this.elem;
        while (elem.children.length > 0) {
            View.get((<HTMLElement>(elem.children[0])).id).destroy();
        }
    }
    collapseList() {
        this.hideList = true;
        this.removeListItems();
    }

    expandList() {
        this.hideList = false;
        this.createListItems();
        this.insertListItems();
    }
}
