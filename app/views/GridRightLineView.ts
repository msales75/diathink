///<reference path="View.ts"/>
m_require("app/views/View.js");
class GridRightLineView extends View {
    parentView: PanelGridView;
    render() {
        this._create({
            type: 'div',
            classes: 'grid-right-line'
        });
        this.setPosition();
        return this.elem;
    }
    layoutDown() {
        var p = this.parentView.layout;
        if (!this.layout) {this.layout = {};}
        this.layout.top = Math.round(0.03* p.height);
        this.layout.height = Math.round(0.94* p.height);
        this.layout.width = 1;
    }
}