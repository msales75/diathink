// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: (c) 2010 M-Way Solutions GmbH. All rights reserved.
//            (c) 2011 panacoda GmbH. All rights reserved.
// Creator:   Dominik
// Date:      03.11.2010
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

m_require('ui/button.js');

/**
 * @class
 *
 * This is the prototype for any list item view. It can only be used as child view of a list
 * view (M.ListView).
 *
 * @extends M.View
 */
M.ListItemView = M.View.extend(
/** @scope M.ListItemView.prototype */ {

    /**
     * The type of this object.
     *
     * @type String
     */
    type: 'M.ListItemView',

    /**
     * States whether the list view item is currently in edit mode or not. This is mainly used by
     * the built-in toggleRemove() functionality of list views.
     *
     * @type Boolean
     */
    inEditMode: NO,

    /**
     * This property determines whether a list item has one single action that is triggered
     * once there is a click anywhere inside the list item or if there are specific actions
     * defined for single ui elements within one list item.
     *
     * @type Boolean
     */
    hasSingleAction: YES,

    /**
     * This property contains the list item's delete button that is automatically shown if the
     * list view's built-in toggleRemove() functionality is used.
     *
     * @type M.ButtonView
     */
    // deleteButton: M.ButtonView.design({
        //icon: 'delete',
        //value: ''
    // }),

    /**
     * This property determines whether the list item is a divider or not.
     *
     * @type Boolean
     */
    isDivider: NO,

    /**
     * This property specifies the recommended events for this type of view.
     *
     * @type Array
     */
    recommendedEvents: ['tap'],

    /**
     * This property can be used to specify whether a list item can be selected or not. Note, that this
     * only affects styling stuff. If set to NO, you still can apply e.g. tap events.
     *
     * @type Boolean
     */
    isSelectable: YES,

    /**
     * This property can be used to specify a button that appears on a swipe left or swipe right
     * gesture (as known from the iphone). Simply specify a tap event for that button and provide a
     * custom method to handle the event. This can e.g. be used as a delete button.
     *
     * By default the button will look like a delete button (in red) and display 'delete'. To change this,
     * simply pass a value to set the label and make use of the cssClass property. To get a standard button
     * as you now it from the other parts of the framework, set the cssClass property's value to:
     *
     *   - 'a'  ->  black
     *   - 'b'  ->  blue
     *   - 'c'  ->  light grey
     *   - 'd'  ->  white
     *   - 'e'  ->  yellow
     *
     * Check the jQM docs for further information and visual samples of these themes:
     * http://jquerymobile.com/test/docs/buttons/buttons-themes.html
     *
     * A valid and usefull configuration of such a swipe button could e.g. look like the following:
     *
     *   swipeButton: M.ButtonView.design({
     *     events: {
     *       tap: {
     *         target: MyApp.MyController,
     *         action: 'removeItem'
     *       }
     *     },
     *     cssClass: 'e'
     *   })
     *
     * The event handler (removeItem() in the sample above) will be called with two parameters:
     *
     *   - domID  ->  The DOM id of the list item view, e.g. 'm_123'
     *   - id  ->  The id/recordId of the list item based on the bound data
     *
     * @type M.ButtonView
     */
    swipeButton: null,

    modelType: null, // pointer to class of model, used with modelId

    /**
     * Renders a list item as an li-tag. The rendering is initiated by the parent list view.
     *
     * @private
     * @returns {String} The list item view's html representation.
     */
    render: function() {
        this.html = '<li id="' + this.id + '"' + this.style();

        if(this.isDivider) {
            this.html += ' data-role="list-divider"';
        }

        this.html += '>';

        if(this.childViews) {
            if(this.inEditMode) {
                this.html += '<a href="#">';
                this.renderChildViews();
                this.html += '</a>';

                // this.html += this.deleteButton.render();
            } else {
                if(this.isSelectable) {
                    this.html += '<a href="#">';
                    this.renderChildViews();
                    this.html += '</a>';
                } else {
                    this.renderChildViews();
                }
            }
        } else if(this.value) {
            this.html += this.value;
        }

        this.html += '</li>';

        return this.html;
    },

    /**
     * Triggers render() on all children. This method defines a special rendering behaviour for a list item
     * view's child views.
     *
     * @override
     * @private
     */
    renderChildViews: function() {
        if(this.childViews) {
            var childViews = this.getChildViewsAsArray();
            for(var i in childViews) {
                var childView = this[childViews[i]];
                if(childView) {
                    childView._name = childViews[i];
                    childView.parentView = this;

                    if(childView.type === 'M.ButtonView') {
                        this.html += '<div>' + childView.render() + '</div>';
                    } else {
                        this.html += childView.render();
                    }
                } else {
                    this.childViews = this.childViews.replace(childViews[i], ' ');
                    M.Logger.log('There is no child view \'' + childViews[i] + '\' available for ' + this.type + ' (' + (this._name ? this._name + ', ' : '') + '#' + this.id + ')! It will be excluded from the child views and won\'t be rendered.', M.WARN);
                }
            }
            return this.html;
        }
    },

    /**
     * This method is responsible for registering events for view elements and its child views. It
     * basically passes the view's event-property to M.EventDispatcher to bind the appropriate
     * events.
     *
     * It extend M.View's registerEvents method with some special stuff for list item views and
     * their internal events.
     */
    registerEvents: function() {
        this.internalEvents = {};
/*
        this.internalEvents = {
            tap: {
                target: this.parentView,
                action: 'setActiveListItem'
            }
        };
        if(this.swipeButton) {
            $.extend(this.internalEvents, {
                swipeleft: {
                    target: this.parentView,
                    action: 'showSwipeButton'
                },
                swiperight: {
                    target: this.parentView,
                    action: 'showSwipeButton'
                }
            })
        }
 */
        this.bindToCaller(this, M.View.registerEvents)();
    },

    /**
     * Applies some style-attributes to the list item.
     *
     * @private
     * @returns {String} The list item's styling as html representation.
     */
    style: function() {
        var html = '';
        if(this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        return html;
    },

    /**
     * This method is used as the event handler of the tap event of a swipe button. All it does
     * is to collect the required information for the external handler (domID, modelID) and call
     * this external handler (if there is one specified).
     *
     * @private
     */
    swipeButtonClicked: function(id, event, nextEvent) {
        id = this.id;
        var modelId = M.ViewManager.getViewById(id).modelId;

        /* delegate event to external handler, if specified */
        if(nextEvent) {
            M.EventDispatcher.callHandler(nextEvent, event, NO, [id, modelId]);
        }
    },

    // MS custom theme function to handle changes in list-sequence, active-status, etc.
    // todo: class-names should probably not be hard-coded
    // todo: position of ul inside list should probably not be hard-coded
    theme: function(andParent,andNext,andPrev) {
        if (andParent === undefined) {andParent=true;}
        if (andNext === undefined) {andNext=true;}
        if (andPrev === undefined) {andPrev=true;}

        var elem = $('#'+this.id);
        if (elem.length !== 1) {
            return;
        }
        // check for change to adjacency affecting borders
        if (elem.next('li').length>0) {
            elem.removeClass('ui-last-child');
        } else {
            elem.addClass('ui-last-child');
        }
        if (elem.prev('li').length>0) {
            elem.removeClass('ui-first-child');
        } else {
            elem.addClass('ui-first-child');
        }

        // check for change to child-content affecting leaf/branch
        if (elem.children('div').children('div').children('a').children('ul').children().length>0) {
            elem.addClass('branch').removeClass('leaf');
            if (!elem.hasClass('collapsed')) {
                elem.addClass('expanded');
            }
        } else {
            elem.addClass('leaf').removeClass('branch').
              addClass('expanded').removeClass('collapsed');
        }
        if (andParent) {
            var parent = this.parentView.parentView;
            if (parent && (parent.type==='M.ListItemView')) {
                parent.theme(false,false,false);
            }
        }
        if (andNext) {
            var next = elem.next('li');
            if (next.length>0) {
                M.ViewManager.getViewById(next.attr('id')).theme(false,false,false);
            }
        }
        if (andPrev) {
            var prev = elem.prev('li');
            if (prev.length>0) {
                M.ViewManager.getViewById(prev.attr('id')).theme(false,false,false);
            }
        }

        this.themeChildViews();
    }


});
