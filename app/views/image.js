m_require("app/foundation/view.js");

M.ImageView = M.View.subclass({
    type: 'M.ImageView',

    render: function() {
        this.computeValue();
        this.html = '<img id="' + this.id + '" src="' + (this.value && typeof(this.value) === 'string' ? this.value : '') + '"' + this.style() + ' />';
        return this.html;
    },

    renderUpdate: function() {
        this.computeValue();
        $('#' + this.id).attr('src', this.value);
    },

    theme: function() {
    },
    
    style: function() {
        var html = '';
        if(this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        return html;
    },

    sourceIsInvalid: function(id, event, nextEvent) {
        M.Logger.log('The source \'' + this.value + '\' is invalid, so we hide the image!', M.WARN);
        $('#' + this.id).addClass('tmp-image-hidden');
    },

    sourceIsValid: function(id, event, nextEvent) {
        $('#' + this.id).removeClass('tmp-image-hidden');
    }

});
