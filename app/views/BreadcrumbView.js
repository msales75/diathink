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
m_require("app/foundation/view.js");

M.BreadcrumbView = M.View.subclass(
    /** @scope M.BreadcrumbView.prototype */ {

        /**
         * The type of this object.
         *
         * @type String
         */
        type: 'M.BreadcrumbView',

        defineFromModel: function(model) {
            var crumb;
            this.value = [];
            if (model !== null) {
                crumb = model;
                while (crumb != null) {
                    this.value.unshift(crumb);
                    crumb = crumb.get('parent');
                }
            }
        },

        render: function() {
            this.html = '<span id="'+this.id+'"' + this.style() + '>';
            this.html += '<a data-href="home">Home</a> &gt;&gt;';
            if (this.value.length>0) {
                for (i=0; i<this.value.length-1; ++i) {
                    // todo: secure displayed text
                    this.html += '<a data-href="'+this.value[i].cid+'">'+this.value[i].get('text')+'</a> &gt;&gt;';
                }
                this.html += ' <strong>'+this.value[i].get('text')+'</strong>';
            }
            this.html += '</span>';
            return this.html
        },

        renderUpdate: function() {
            var html = '';
            html += '<a data-href="home">Home</a> &gt;&gt;';
            if (this.value.length>0) {
               for (i=0; i<this.value.length-1; ++i) {
                  // todo: secure displayed text
                  html += '<a data-href="'+this.value[i].cid+'">'+this.value[i].get('text')+'</a> &gt;&gt;';
               }
               html += ' <strong>'+this.value[i].get('text')+'</strong>';
            }
            $('#'+this.id).html(html);
        },


        /**
         * Triggers the rendering engine, jQuery mobile, to style the button.
         *
         * @private
         */
        theme: function() {
            /* theme only if not already done */
            //if(!$('#' + this.id).hasClass('ui-breadcrumb')) {
                $('#'+this.id).addClass('ui-breadcrumb');
                $('#'+this.id).children('a').addClass('ui-breadcrumb-link').addClass('ui-link');
            //}
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
            return html;
        }

    });
