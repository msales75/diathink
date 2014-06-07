///<reference path="View.ts"/>
///<reference path="../events/ScrollHandler.ts"/>

m_require("app/views/View.js");
class ScrollView extends View {
    scrollHandler:ScrollHandler = null; // scroll handler
    render() {
        this._create({
            type: 'div',
            classes: this.cssClass
        });
        this.elem.setAttribute('data-role', 'content');
        this.renderChildViews();
        this.positionChildren(null);
        this.setPosition();
        for (var name in this.childViewTypes) {
            this.elem.appendChild((<View>(this[name])).elem);
        }
        this.scrollHandler = new ScrollHandler({
            element: this.elem
        });
        return this.elem;
    }
}