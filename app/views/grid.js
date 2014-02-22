m_require("app/foundation/view.js");

M.TWO_COLUMNS = {
    cssClass: 'ui-grid-a',
    columns: {
        0: 'ui-block-a',
        1: 'ui-block-b'
    }
};

M.THREE_COLUMNS = {
    cssClass: 'ui-grid-b',
    columns: {
        0: 'ui-block-a',
        1: 'ui-block-b',
        2: 'ui-block-c'
    }
};

M.FOUR_COLUMNS = {
    cssClass: 'ui-grid-c',
    columns: {
        0: 'ui-block-a',
        1: 'ui-block-b',
        2: 'ui-block-c',
        3: 'ui-block-d'
    }
};

M.GridView = M.View.subclass({

    type: 'M.GridView',

    layout: null,
    
    cssClass: '',

    render: function() {
        this.html = '<div id="' + this.id + '" ' + this.style() + '>';

        this.renderChildViews();

        this.html += '</div>';

        return this.html;
    },

    renderChildViews: function() {
        if(this.childViews) {
            if(this.layout) {
                var arr = this.childViews.split(' ');
                for(var i in this.layout.columns) {
                    if(this[arr[i]]) {
                        this.html += '<div class="' + this.layout.columns[i] + '">';

                        this[arr[i]]._name = arr[i];
                        this.html += this[arr[i]].render();

                        this.html += '</div>';
                        // MS change GridView to fix parentView bug
                        this[arr[i]].parentView = this;
                    }
                }
            } else {
                M.Logger.log('No layout specified for GridView (' + this.id + ')!', M.WARN);
            }
        }
    },

    theme: function() {
        this.themeChildViews();
    },

    style: function() {
        if(this.layout) {
            var html = 'class="' + this.layout.cssClass + ' ' + this.cssClass + '"';
            return html;
        }
    }

});
