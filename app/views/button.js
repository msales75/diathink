m_require("app/foundation/view.js");

M.ButtonView = M.View.subclass({

    type: 'M.ButtonView',

    isActive: NO,

    isIconOnly: NO,

    hyperlinkType: null,

    hyperlinkTarget: null,

    tag: null,

    dataTheme: '',

    render: function() {
        this.computeValue();
        this.html = '<a id="' + this.id + '" ' + this.style() + ' href="#">';
        this.html += '<span class="ui-btn-inner"><span class="ui-btn-text">'+this.value+'</span></span>';
        this.html += '</a>';
        return this.html;
    },

    renderUpdate: function() {
        this.computeValue();
        $('#' + this.id + ' .ui-btn-text').text(this.value);
    },

    theme: function() {
        /* theme only if not already done */
        if(!$('#' + this.id).hasClass('ui-btn')) {
            // MS: replace buttonMarkup with new theme?
            $('#'+this.id).addClass('ui-btn ui-btn-up-a ui-shadow ui-btn-corner-all ui-btn-icon-notext');
            $('#'+this.id).children('span').addClass('ui-btn-inner');
            $('#'+this.id).children('span').children('span').addClass('ui-btn-text');
            // $('#' + this.id).buttonMarkup();

        }
    },

    style: function() {
        var html = '';
        if(this.isInline) {
            html += ' data-inline="true"';
        }
        if(this.icon) {
            html += ' data-icon="' + this.icon + '"';
        }
        if(this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        if(this.dataTheme) {
            html += ' data-theme="' + this.dataTheme + '"';
        }
        if(this.isIconOnly) {
            html += ' data-iconpos="notext"';
        }
        return html;
    },


    disable: function() {
        if(this.isEnabled) {
            var html = $('#' + this.id).html();
            html = '<div data-theme="c" class="ui-shadow ui-disabled" aria-disabled="true">' + html + '</div>';
            $('#' + this.id).html(html);
            this.isEnabled = NO;
        }
    },

    enable: function() {
        if(!this.isEnabled) {
            var html = $('#' + this.id + ' div').html();
            $('#' + this.id).html(html);
            this.isEnabled = YES;
        }
    }

});
