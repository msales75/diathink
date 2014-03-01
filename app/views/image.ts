///<reference path="../foundation/view.ts"/>
m_require("app/foundation/view.js");

class ImageView extends View {
    type= 'ImageView';

    render() {
        this.computeValue();
        this.html = '<img id="' + this.id + '" src="' + (this.value && typeof(this.value) === 'string' ? this.value : '') + '"' + this.style() + ' />';
        return this.html;
    }

    renderUpdate() {
        this.computeValue();
        $('#' + this.id).attr('src', this.value);
    }

    theme() {
    }
    
    style() {
        var html = '';
        if(this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        return html;
    }

    sourceIsInvalid(id, event, nextEvent) {
        M.Logger.log('The source \'' + this.value + '\' is invalid, so we hide the image!', M.WARN);
        $('#' + this.id).addClass('tmp-image-hidden');
    }

    sourceIsValid(id, event, nextEvent) {
        $('#' + this.id).removeClass('tmp-image-hidden');
    }

}
