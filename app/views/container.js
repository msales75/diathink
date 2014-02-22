m_require("app/foundation/view.js");

M.ContainerView = M.View.subclass({

    type: 'M.ContainerView',

    render: function() {
        this.html = '<div id="' + this.id + '"' + this.style() + '>';

        this.renderChildViews();

        this.html += '</div>';

        return this.html;
    },

    style: function() {
        var html = '';
        if(this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        return html;
    }

});