/* MS additional View for working with keyboard.js */
/**
 * @class
 *
 * M.HiddenInputView
 *
 * @extends M.View
 */
M.HiddenInputView = M.View.subclass(
    /** @scope M.HiddenInputView.prototype */ {

        /**
         * The type of this object.
         *
         * @type String
         */
        type: 'M.HiddenInputView',

        /**
         * The name of the text field. During the rendering, this property gets assigned to the name
         * property of the text field's html representation. This can be used to manually access the
         * text field's DOM representation later on.
         *
         * @type String
         */
        name: null,

        /**
         * This property specifies the recommended events for this type of view.
         *
         * @type Array
         */
        recommendedEvents: ['focus', 'blur'],

        /**
         * Renders a HiddenInputView
         *
         * @private
         * @returns {String} The text field view's html representation.
         */
        render: function() {
            this.html = '<input type="text" name="' + (this.name ? this.name : this.id) + '" id="' + this.id + '"' + this.style() + ' value="" />';
            return this.html;
        },


        /**
         * Method to append css styles inline to the rendered text field.
         *
         * @private
         * @returns {String} The text field's styling as html representation.
         */
        style: function() {
            var html = '';
            if(this.cssClass) {
                html += ' class="' + this.cssClass + '"';
            }
            return html;
        }

    });
