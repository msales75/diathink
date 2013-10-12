
/**
 * @class
 *
 * M.SpanView
 *
 * @extends M.View
 */
M.SpanView= M.View.extend(
    /** @scope M.TextFieldView.prototype */ {

        /**
         * The type of this object.
         *
         * @type String
         */
        type: 'M.SpanView',

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
        recommendedEvents: [],

        /**
         * Renders a TextFieldView
         *
         * @private
         * @returns {String} The text field view's html representation.
         */
        render: function() {
            this.computeValue();
            this.html = '';
            this.html += '<span id="' + this.id + '"' + this.style() +'>'+(this.value? this.value : '')+'</span>';
            return this.html;
        },


        /**
         * The contentDidChange method is automatically called by the observable when the
         * observable's state did change. It then updates the view's value property based
         * on the specified content binding.
         *
         * This is a special implementation for M.TextFieldView.
         */
        contentDidChange: function(){
            /* if the text field has the focus, we do not apply the content binding */
            if(this.hasFocus) {
                return;
            }

            /* let M.View do the real job */
            this.bindToCaller(this, M.View.contentDidChange)();

            this.renderUpdate();
            this.delegateValueUpdate();
        },

        /**
         * Updates a TextFieldView with DOM access by jQuery.
         *
         * @param {Boolean} preventValueComputing Determines whether to execute computeValue() or not.
         * @private
         */
        renderUpdate: function(preventValueComputing) {
            if(!preventValueComputing) {
                this.computeValue();
            }
            $('#' + this.id).text(this.value);
            // this.styleUpdate();
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
        },

        /**
         * This method sets its value to the value it has in its DOM representation
         * and then delegates these changes to a controller property if the
         * contentBindingReverse property is set.
         *
         * Additionally call target / action if set.
         *
         * @param {String} id The DOM id of the event target.
         * @param {Object} event The DOM event.
         * @param {Object} nextEvent The next event (external event), if specified.
         */
        setValueFromDOM: function(id, event, nextEvent) {
            this.value = this.secure($('#' + this.id).text());
            this.delegateValueUpdate();

            if(nextEvent) {
                M.EventDispatcher.callHandler(nextEvent, event, YES);
            }
        },

        /**
         * This method sets the text field's value, initiates its re-rendering
         * and call the delegateValueUpdate().
         *
         * @param {String} value The value to be applied to the text field view.
         * @param {Boolean} delegateUpdate Determines whether to delegate this value update to any observer or not.
         * @param {Boolean} preventValueComputing Determines whether to execute computeValue() or not.
         */
        setValue: function(value, delegateUpdate, preventValueComputing) {
            this.value = value;

            this.renderUpdate(preventValueComputing);

            if(delegateUpdate) {
                this.delegateValueUpdate();
            }
        },

        /**
         * This method clears the text field's value, both in the DOM and within the JS object.
         */
        clearValue: function() {
            this.setValue('');

            /* call lostFocus() to get the initial text displayed */
            this.lostFocus();
        },

        /**
         * This method returns the text field view's value.
         *
         * @returns {String} The text field view's value.
         */
        getValue: function() {
            return this.value;
        }

    });
