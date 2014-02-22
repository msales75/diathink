m_require("app/foundation/view.js");
/* MS additional View for working with keyboard.js */
M.HiddenInputView = M.View.subclass({

        type: 'M.HiddenInputView',

        name: null,

        render: function() {
            this.html = '<input type="text" name="' + (this.name ? this.name : this.id) + '" id="' + this.id + '"' + this.style() + ' value="" />';
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
