///<reference path="View.ts"/>
m_require("app/views/View.js");
class PageView extends View {
    postRender():void {}

    render() {
        this._create({
            type: 'div',
            classes: this.cssClass
        })
        this.elem.setAttribute('data-role', 'page');
        this.renderChildViews();
        (<HTMLElement>(document.documentElement)).className = 'ui-mobile landscape';
        document.body.className = 'ui-mobile-viewport ui-overlay-c';
        document.body.appendChild(this.elem);
        for (var name in this.childViewTypes) {
            this.elem.appendChild((<View>(this[name])).elem);
        }
        this.postRender();
        return this.elem;
    }
}