///<reference path="View.ts"/>
m_require("app/views/View.js");
class ContainerView extends View {
    render() {
        this._create({
            type: 'div',
            classes: this.cssClass
        });
        this.renderChildViews();
        for (var name in this.childViewTypes) {
            this.elem.appendChild((<View>(this[name])).elem);
        }
	return this.elem;
    }
}
