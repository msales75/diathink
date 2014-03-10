///<reference path="View.ts"/>
m_require("app/views/View.js");
class SpanView extends View {
    render() {
        this._create({
            type: 'span',
            classes: this.cssClass,
            html: (this.value ? this.value : '')
        });
        return this.elem;
    }
}
