///<reference path="../foundation/view.ts"/>
m_require("app/foundation/view.js");

class ButtonView extends View {
    type= 'ButtonView';
    isEnabled = true;

    render() {
        this.computeValue();
        this.html = '<a id="' + this.id + '" ' + this.style() + ' href="#">';
        this.html += '<span class="ui-btn-inner"><span class="ui-btn-text">'+this.value+'</span></span>';
        this.html += '</a>';
        return this.html;
    }

    theme() {
        /* theme only if not already done */
        if(!$('#' + this.id).hasClass('ui-btn')) {
            $('#'+this.id).addClass('ui-btn ui-btn-up-a ui-shadow ui-btn-corner-all ui-btn-icon-notext');
            $('#'+this.id).children('span').addClass('ui-btn-inner');
            $('#'+this.id).children('span').children('span').addClass('ui-btn-text');
        }
    }

    style() {
        var html = '';
        if(this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        return html;
    }


    disable() {
        if(this.isEnabled) {
            var html = $('#' + this.id).html();
            html = '<div data-theme="c" class="ui-shadow ui-disabled" aria-disabled="true">' + html + '</div>';
            $('#' + this.id).html(html);
            this.isEnabled = NO;
        }
    }

    enable() {
        if(!this.isEnabled) {
            var html = $('#' + this.id + ' div').html();
            $('#' + this.id).html(html);
            this.isEnabled = YES;
        }
    }

}
