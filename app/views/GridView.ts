///<reference path="View.ts"/>
m_require("app/views/View.js");
class GridView extends View {
    numCols:number;
    itemWidth:number;

    render() {
        this._create({
            type: 'div',
            classes: this.cssClass,
            html: ''
        });
        this.insertListItems();
        this.setPosition();
        return this.elem;
    }

    positionChildren(v:View) {
        this.itemWidth = Math.floor(this.parentView.layout.width/this.numCols);
        var c:string = this.listItems.first();
        var w = 0;
        if (v!=null) {
            w = v.layout.left + v.layout.width;
            c = this.listItems.next[v.id];
        }
        for ( ; c!==''; c = this.listItems.next[c]) {
            var child:PanelView = <PanelView>this.listItems.obj[c];
            if (!child.layout) {child.layout= {};}
            if (child.layout.left!==w) {
                child.layout.left = w;
                if (child.elem) {
                    $(child.elem).css('left', w+'px');
                }
            }
            w += child.layout.width;
        }
    }

}
