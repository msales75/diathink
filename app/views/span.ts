///<reference path="../foundation/view.ts"/>
m_require("app/foundation/view.js");

class SpanView extends View {
    type = 'SpanView';

    render() {
        this.computeValue();
        this.html = '';
        this.html += '<span id="' + this.id + '"' + this.style() + '>' + (this.value ? this.value : '') + '</span>';
        return this.html;
    }

    style() {
        var html = '';
        if (this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        return html;
    }
}
