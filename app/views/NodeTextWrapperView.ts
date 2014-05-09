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
    render() {
        this._create({
            type: 'div',
            classes: this.cssClass
        });
        this.renderChildViews();
        for (var name in this.childViewTypes) {
            this.elem.appendChild((<View>(this[name])).elem);
        }
        this.insertListItems();
        return this.elem;
    }
    redrawLinks() {
        this.removeListItems();
        this.createListItems();
        this.insertListItems();
        this.text.fixHeight();
    }
    resize() {
        this.textOffset = {
            top: Number($(this.elem).css('padding-top').replace(/px/,'')) +
                Number($(this.text.elem).css('padding-top').replace(/px/,'')),
            left: Number($(this.elem).css('padding-left').replace(/px/,'')) +
                Number($(this.text.elem).css('padding-left').replace(/px/,''))
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
