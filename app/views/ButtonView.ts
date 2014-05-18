///<reference path="View.ts"/>
m_require("app/views/View.js");
class ButtonView extends View {
    isEnabled = true;
    value:string = 'theme/images/circle.png';
    elem:HTMLAnchorElement;

    render() {
        this._create({
            type: 'div',
            classes: 'button',
            html: '<img src="'+this.value+'" alt="'+this.value+'"/>'
        });
        /*
        this._create({
            type: 'a',
            classes: 'ui-btn ui-btn-up-a ui-shadow ui-btn-corner-all ui-btn-icon-notext ' + this.cssClass,
            html: '<span class="ui-btn-inner"><span class="ui-btn-text">' + this.value + '</span></span></a>'
        });
        this.elem.href = '#';
        */
        this.setPosition();
        return this.elem;
    }

    disable() {
        if (this.isEnabled) {
            this.addClass('disabled');
/*
            var html = this.elem.innerHTML;
            html = '<div data-theme="c" class="ui-shadow ui-disabled" aria-disabled="true">' + html + '</div>';
            this.elem.innerHTML = html;
            */
            this.isEnabled = NO;
        }
    }

    enable() {
        if (!this.isEnabled) {
            this.removeClass('disabled');
/*            var html = (<HTMLElement>(this.elem.children[0])).innerHTML;
            this.elem.innerHTML = html; */
            this.isEnabled = YES;
        }
    }
    validate() {
        super.validate();
        assert(this.isEnabled===(! $(this.elem).hasClass('disabled')), "Button enabled does not match disabled-class");
        assert(this.value===$(this.elem).children('img').attr('src'), "Image button does not match value");
        assert(this.value===$(this.elem).children('img').attr('alt'), "Image button does not match alt");
    }
}
