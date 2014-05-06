///<reference path="View.ts"/>
m_require("app/views/View.js");

class NodeLinkView extends View {
    parentView:NodeTextWrapperView;
    value:OutlineNodeModel;
    top:number;
    left:number;
    render():HTMLElement {
        this._create({
            type:'div',
            classes: 'node-link',
            html: this.value.get('text')
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
}