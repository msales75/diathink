///<reference path="View.ts"/>
m_require("app/views/View.js");
class ScrollView extends View {
    scrollview = null; // scroll handler
    render() {
        this._create({
            type: 'div',
            classes: this.cssClass
        })
        this.elem.setAttribute('data-role', 'content');
        this.renderChildViews();
        for (var name in this.childViewTypes) {
            this.elem.appendChild((<View>(this[name])).elem);
        }
        this.scrollview = new $D.scrollview({
            element: this.elem,
            direction: 'y',
            delayedClickEnabled: false
            // MS - prevents double-handling of tap when using bubbling/delegated
            // updateScroll: this.updateScroll
        });
        return this.elem;
    }
}