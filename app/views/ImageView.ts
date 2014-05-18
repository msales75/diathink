///<reference path="View.ts"/>
m_require("app/views/View.js");

class ImageView extends View {
    elem:HTMLImageElement;

    render() {
        this._create({
            type: 'img',
            classes: this.cssClass
        });
        this.elem.src = (this.value && typeof(this.value) === 'string' ? this.value : '');
        this.setPosition();
        return this.elem;
    }

    renderUpdate() {
        this.elem.src = this.value;
    }

    sourceIsInvalid(id, event, nextEvent) {
        this.addClass('tmp-image-hidden');
    }

    sourceIsValid(id, event, nextEvent) {
        this.removeClass('tmp-image-hidden');
    }
}
