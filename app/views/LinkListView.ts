///<reference path="View.ts"/>
m_require("app/views/View.js");

class LinkListView extends View {
    parentView:NodeTextWrapperView;
    value:OutlineNodeCollection;
    listItemTemplate:typeof NodeLinkView;
    listItems:LinkedList<NodeLinkView>;

    init() {
        this.listItemTemplate = NodeLinkView;
    }
    render() {
        assert(this.elem == null, "Rendering a list that already exists");
        this._create({
            type: 'div',
            classes: 'link-list'
        });
        this.insertListItems();
        // this.redraw(); // todo: does this require textarea already in DOM?
        return this.elem;
    }
    updateValue() {
        this.value = this.nodeView.value.attributes.links;
    }

    setOffsets() { // create hidden div to get coords using fixHeight
        this.nodeView.header.name.text.fixHeight();
    }
    redraw() {
        this.setOffsets();
        var l:string;
        for (l=this.listItems.next[''];l!=='';l=this.listItems.next[l]) {
            var v:NodeLinkView = this.listItems.obj[l];
            if (! v.elem) {
                v.render();
                this.elem.appendChild(v.elem);
            }
        }
    }
    append(link:NodeLinkView) {
        this.value.append(link.value.cid, link.value);
        this.listItems.append(link.id, link);
        this.redraw();
    }
    validate() {
        // todo: validate that views match with hidden-obj children

    }
}