// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: (c) 2010 M-Way Solutions GmbH. All rights reserved.
//            (c) 2011 panacoda GmbH. All rights reserved.
// Creator:   Dominik
// Date:      02.11.2010
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

/**
 * @class
 *
 * This defines the prototype for any button view. A button is a view element that is
 * typically used for triggering an action, e.g. switching to another page, firing a
 * request or opening a dialog.
 *
 * @extends M.View
 */
M.BreadcrumbView = M.View.extend(
    /** @scope M.ButtonView.prototype */ {

        /**
         * The type of this object.
         *
         * @type String
         */
        type: 'M.BreadcrumbView',

        /**
         * This property specifies the recommended events for this type of view.
         *
         * @type Array
         */
        recommendedEvents: ['click', 'tap', 'vclick'],

        render: function() {
            this.html = '<span id="'+this.id+'"' + this.style() + '>';
            for (i=0; i<this.value.length; ++i) {
                // todo: secure displayed text
                this.html += '<a data-href="'+this.value[i].cid+'">'+this.value[i].get('text')+'</a>';
            }
            this.html += '</span>';
            return this.html
        },

        /**
         * This method is responsible for registering events for view elements and its child views. It
         * basically passes the view's event-property to M.EventDispatcher to bind the appropriate
         * events.
         *
         * It extend M.View's registerEvents method with some special stuff for list views and their
         * internal events.
         */
            /*
        registerEvents: function() {
            if(!this.internalEvents) {
                this.internalEvents = {
                    tap: {
                        target: this,
                        action: 'dispatchEvent'
                    }
                }
            }
            this.bindToCaller(this, M.View.registerEvents)();
        }, */

        /**
         * Triggers the rendering engine, jQuery mobile, to style the button.
         *
         * @private
         */
        theme: function() {
            /* theme only if not already done */
            if(!$('#' + this.id).hasClass('ui-breadcrumb')) {
                $('#'+this.id).addClass('ui-breadcrumb');
            }
        },

        /**
         * Applies some style-attributes to the button.
         *
         * @private
         * @returns {String} The button's styling as html representation.
         */
        style: function() {
            var html = '';
            if(this.cssClass) {
                html += ' class="' + this.cssClass + '"';
            }
            if(this.cssStyle) {
                html += 'style="' + this.cssStyle + '"';
            }
            return html;
        }

        /**
         * This method is called right before the page is loaded. If a beforeLoad-action is defined
         * for the page, it is now called.
         *
         * @param {String} id The DOM id of the event target.
         * @param {Object} event The DOM event.
         * @param {Object} nextEvent The next event (external event), if specified.
         */
            /*
        dispatchEvent: function(id, event, nextEvent) {
            if(this.isEnabled && nextEvent) {
                M.EventDispatcher.callHandler(nextEvent, event, YES);
            }
        } */

    });
