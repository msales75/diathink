///<reference path="View.ts"/>
m_require("app/views/View.js");

class GridView extends View {
    numCols: number;
    render() {
        this._create({
            type: 'div',
            classes: this.cssClass,
            html: ''
        });
        this.insertListItems();
        return this.elem;
    }
    renderListItems() {
        super.renderListItems();
        this.updateWidths();
    }
    updateWidths() {
        if (this.elem) { // don't do this until the view's been rendered
            var width:number = 100.0/this.numCols;
            var widthS = String(Math.round(10000*width)/10000)+'%';
            var m:string;
            var children:LinkedList<PanelView> = <LinkedList<PanelView>>this.listItems;
            for (m=children.first();m!=='';m=children.next[m]) {
                children.obj[m].elem.style.width = widthS;
            }
        }
    }
}
