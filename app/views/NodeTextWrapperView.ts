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
    resize() {
        this.textOffset = {
            top: Number($(this.elem).css('padding-top').replace(/px/,'')) +
                Number($(this.text.elem).css('padding-top').replace(/px/,'')),
            left: Number($(this.elem).css('padding-left').replace(/px/,'')) +
                Number($(this.text.elem).css('padding-left').replace(/px/,''))
        };
    }
}
