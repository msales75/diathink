///<reference path="View.ts"/>
m_require("app/views/View.js");
class GridView extends View {
    numCols:number;
    itemWidth:number;

    resize() {
        if (this.elem) {
            if (this.elem.parentNode) {
                var p:string;
                this.itemWidth = Math.floor(this.parentView.elem.clientWidth / this.numCols);
                for (p in this.listItems.obj) {
                    $((<View>this.listItems.obj[p]).elem).css('width', String(this.itemWidth) + 'px');
                }
            } else {
                var p:string;
                var relativeWidth = String(Math.round(100000.0 / this.numCols)/1000)+'%';
                for (p in this.listItems.obj) {0
                    $((<View>this.listItems.obj[p]).elem).css('width', relativeWidth);
                }
            }
        }
    }

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
        this.resize();
    }
}
