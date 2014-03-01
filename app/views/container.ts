///<reference path="../foundation/view.ts"/>
m_require("app/foundation/view.js");

class ContainerView extends View {

    type = 'ContainerView';

    render() {
        this.html = '<div id="' + this.id + '"' + this.style() + '>';
        this.renderChildViews();
        this.html += '</div>';
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