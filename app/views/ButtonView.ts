///<reference path="View.ts"/>
m_require("app/views/View.js");
class ButtonView extends View {
    isEnabled = true;
    elem:HTMLAnchorElement;

    render() {
        this._create({
            type: 'a',
            classes: 'ui-btn ui-btn-up-a ui-shadow ui-btn-corner-all ui-btn-icon-notext ' + this.cssClass,
            html: '<span class="ui-btn-inner"><span class="ui-btn-text">' + this.value + '</span></span></a>'
        });
        this.elem.href = '#';
        return this.elem;
    }

    disable() {
        if (this.isEnabled) {
            var html = this.elem.innerHTML;
            html = '<div data-theme="c" class="ui-shadow ui-disabled" aria-disabled="true">' + html + '</div>';
            this.elem.innerHTML = html;
            this.isEnabled = NO;
        }
    }

    enable() {
        if (!this.isEnabled) {
            var html = (<HTMLElement>(this.elem.children[0])).innerHTML;
            this.elem.innerHTML = html;
            this.isEnabled = YES;
        }
    }
}
