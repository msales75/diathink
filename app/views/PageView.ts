///<reference path="View.ts"/>
m_require("app/views/View.js");
class PageView extends View {
    public hiddendiv:HiddenDivView;
    hiddentype:any;
    prerender() {
        this._create({
            type: 'div',
            classes: this.cssClass
        });
        // put hiddenview into DOM immediately.
        this.hiddendiv.render();
        this.elem.appendChild((<View>this.hiddendiv).elem);
        this.hiddentype = this.childViewTypes['hiddendiv'];
        delete this.childViewTypes['hiddendiv'];

        // this.elem.setAttribute('data-role', 'page');
        (<HTMLElement>(document.documentElement)).className = 'ui-mobile landscape';
        document.body.className = 'ui-mobile-viewport ui-overlay-c';
        document.body.appendChild(this.elem);
    }
    render() {
            this.renderChildViews();
            this.setPosition();
            for (var name in this.childViewTypes) {
                this.elem.appendChild((<View>(this[name])).elem);
            }
            // restore hiddendiv type
            this.childViewTypes['hiddendiv'] = this.hiddentype;
            this.hiddentype = null;
        return this.elem;
    }
}