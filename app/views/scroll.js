// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: (c) 2010 M-Way Solutions GmbH. All rights reserved.
//            (c) 2011 panacoda GmbH. All rights reserved.
// Creator:   Sebastian
// Date:      02.11.2010
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================
m_require("app/foundation/view.js");

M.ScrollView = M.View.subclass({

    type: 'M.ScrollView',

    /**
     * Renders in three steps:
     * 1. Rendering Opening div tag with corresponding data-role
     * 2. Triggering render process of child views
     * 3. Rendering closing tag
     *
     * @private
     * @returns {String} The scroll view's html representation.
     */
    render: function() {
        this.html = '<div id="' + this.id + '" data-role="content"' + this.style() + '>';

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
    },

    // MS addition for scrollview from jquery-mobile splitscreen
    theme: function() {
        // todo: this needs to be implemented without jquery-mobile
      this.scrollview = new $D.scrollview({
            element: $('#'+this.id).get(0),
            direction: 'y',
            delayedClickEnabled: false
            // MS - prevents double-handling of tap when using bubbling/delegated
            // updateScroll: this.updateScroll
      });
      this.themeChildViews(); // MS fix to avoid list2view bug
    },

    themeUpdate: function() {
        // todo: call after changing height of content?
        /*
        var scrolltop = $('#' + this.id).children('.ui-scrollview-view').position().top;
        $('#' + this.id).scrollTop(0);
        $('#'+this.id).scrollview('scrollTo', 0, scrolltop);
        */
    }

});