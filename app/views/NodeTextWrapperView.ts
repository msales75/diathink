///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

class NodeTextWrapperView extends View {
    parentView:NodeHeaderView;
    text:NodeTextView;
    value:OutlineNodeCollection;
    listItemTemplate:typeof NodeLinkView;
    listItems:LinkedList<NodeLinkView>;
    cssClass = 'outline-content_container link-list';
    textOffset:{top?:number;left?:number} = {};

    init() {
        this.childViewTypes = {
            text: NodeTextView
        };
        this.listItemTemplate = NodeLinkView;
    }
    updateValue() {
        this.value = this.nodeView.value.attributes.links;
    }
    layoutDown() {
        if (!this.layout) {this.layout = {};}
        var w = Math.round(1.4*View.fontSize);
        this.layout.top = 0;
        this.layout.left = w;
        this.layout.width = this.parentView.layout.width-w;
    }
    positionChildren(v:View) {
        var l:Layout = this.text.saveLayout();
        this.text.fixHeight();
        this.text.updateDiffs(l);
    }
    layoutUp() {
        this.layout.height = this.text.layout.height;
    }
    render() {
        this._create({
            type: 'div',
            classes: this.cssClass
        });
        this.renderChildViews();
        for (var name in this.childViewTypes) {
            this.elem.appendChild((<View>(this[name])).elem);
        }
        if (this.listItems && this.listItems.count) {
            this.insertListItems();
        } else {
            this.positionChildren(null); // need to fix height, even if there's no child-links
        }
        this.setPosition();
        return this.elem;
    }
    redrawLinks() {
        this.removeListItems();
        this.createListItems();
        this.insertListItems();
        this.text.resizeUp();
    }
    updateTextOffset() {
        this.textOffset = {
            left: Math.round(.18*View.fontSize),
            top: Math.round(.15*View.fontSize)
        };
    }
    validate() {
        super.validate();
        assert(this.value===this.nodeView.value.attributes.links,
            "NodeTextWrapper has wrong value");
        // value must match with listItems
        if (this.value!=null) {
            assert(this.listItems.count===this.value.count,
                "Length of link listItems does not match value");
            var o:string;
            for (o in this.listItems.obj) {
                var cid:string = this.listItems.obj[o].value.cid;
                assert(this.value.obj[cid] === this.listItems.obj[o].value,
                    "value not found in link list");
                // ensure sequence also matches
                if (this.value.next[cid]!=='') {
                    assert(this.value.next[cid] === this.listItems.obj[this.listItems.next[o]].value.cid,
                        "Sequence does not match links");
                }
            }
        } else {
            assert((this.listItems==null)||(this.listItems.count===0), "");
        }
    }
}
