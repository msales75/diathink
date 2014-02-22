m_require("app/foundation/view.js");

M.SpanView= M.View.subclass({

        type: 'M.SpanView',

        name: null,

        render: function() {
            this.computeValue();
            this.html = '';
            this.html += '<span id="' + this.id + '"' + this.style() +'>'+(this.value? this.value : '')+'</span>';
            return this.html;
        },


        renderUpdate: function(preventValueComputing) {
            if(!preventValueComputing) {
                this.computeValue();
            }
            $('#' + this.id).text(this.value);
            // this.styleUpdate();
        },

        style: function() {
            var html = '';
            if(this.cssClass) {
                html += ' class="' + this.cssClass + '"';
            }
            return html;
        },

        setValueFromDOM: function(id, event, nextEvent) {
            this.value = this.secure($('#' + this.id).text());
            this.delegateValueUpdate();
        },

        getValue: function() {
            return this.value;
        }

    });
