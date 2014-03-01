///<reference path="../foundation/view.ts"/>
m_require("app/foundation/view.js");

class PageView extends View {
    type= 'PageView';
    postRender():void {}
    render():string {
        this.html = '<div id="' + this.id + '" data-role="page"' + this.style() + '>';
        this.renderChildViews();
        this.html += '</div>';
        this.writeToDOM();
        this.theme();
        this.postRender();
        return this.html;
    }
    writeToDOM() {
        var html = $('html');
        html.addClass('ui-mobile landscape');
        var body = $('body');
        body.addClass('ui-mobile-viewport ui-overlay-c');
        body.append(this.html);
    }
    theme() {
        this.themeChildViews(null);
    }
    style() {
        var html = '';
        if(this.cssClass) {
            if(!html) {
                html += ' class="';
            }
            html += this.cssClass;
        }
        if(html) {
            html += '"';
        }
        return html;
    }
}