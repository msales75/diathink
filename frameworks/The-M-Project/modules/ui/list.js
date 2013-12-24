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

m_require('ui/search_bar.js');

/**
 * @class
 *
 * M.ListView is the prototype of any list view. It is used to display static or dynamic
 * content as vertically aligned list items (M.ListItemView). A list view provides some
 * easy to use helper method, e.g. an out-of-the-box delete view for items.
 *
 * @extends M.View
 */
M.ListView = M.View.extend(
/** @scope M.ListView.prototype */ {

    /**
     * The type of this object.
     *
     * @type String
     */
    type: 'M.ListView',

    /**
     * Determines whether to remove all item if the list is updated or not.
     *
     * @type Boolean
     */
    removeItemsOnUpdate: YES,

    /**
     * The list view's items, respectively its child views.
     *
     * @type Array
     */
    items: null,

    /**
     * Defines if the ListView is rendered with prefixed numbering for each item.
     *
     * @type Boolean
     */
    isNumberedList: NO,

    /**
     * This property contains the list view's template view, the blueprint for every child view.
     *
     * @type M.ListItemView
     */
    listItemTemplateView: null,

    /**
     * Determines whether to display the list view 'inset' or at full width.
     *
     * @type Boolean
     */
    isInset: NO,

    /**
     * Determines whether to add margin at the top of the list or not. This is useful whenever
     * the list is not the first element within a page's content area to make sure the list does
     * not overlap preceding elements.
     *
     * @type Boolean
     */
    doNotOverlapAtTop: NO,


    /**
     * Determines whether to add margin at the bottom of the list or not. This is useful whenever
     * the list is not the last element within a page's content area to make sure the list does
     * not overlap following elements.
     *
     * @type Boolean
     */
    doNotOverlapAtBottom: NO,

    /**
     * The list view's search bar.
     *
     * @type Object
      */
    searchBar: M.SearchBarView,

    /**
     * Determines whether or not to display a search bar at the top of the list view. 
     *
     * @type Boolean
     */
    hasSearchBar: NO,

    /**
     * If the hasSearchBar property is set to YES, this property determines whether to use the built-in
     * simple search filters or not. If set to YES, the list is simply filtered on the fly according
     * to the entered search string. Only list items matching the entered search string will be visible.
     *
     * If a custom search behaviour is needed, this property must be set to NO.
     *
     * @type Boolean
     */
    usesDefaultSearchBehaviour: YES,

    /**
     * If the hasSearchBar property is set to YES and the usesDefaultSearchBehaviour is set to YES, this
     * property can be used to specify the inital text for the search bar. This text will be shown as long
     * as nothing else is entered into the search bar text field.
     *
     * @type String
     */
    searchBarInitialText: 'Search...',

    /**
     * An object containing target and action to be triggered if the search string changes.
     *
     * @type Object
     */
    onSearchStringDidChange: null,

    /**
     * An optional String defining the id property that is passed in view as record id
     *
     * @type String
     */
    idName: null,

    /**
     * Contains a reference to the currently selected list item.
     *
     * @type Object
     */
    selectedItem: null,

    /**
     * Contains a reference to the currently visible swipe delete button (if one exists).
     *
     * @type M.ButtonView
     * @private
     */
    swipeButton: null,

    /**
     * This property can be used to determine whether or not to use a list items index as its refer id.
     *
     * @type Boolean
     * @private
     */
    useIndexAsId: NO,

    /**
     * if this is the top-level list of an outline, this is the outline controller
    */
    rootController: null,

    /**
     * This method renders the empty list view either as an ordered or as an unordered list. It also applies
     * some styling, if the corresponding properties where set.
     *
     * @private
     * @returns {String} The list view's styling as html representation.
     */
    render: function() {
        /* add the list view to its surrounding page */


        if(!M.ViewManager.currentlyRenderedPage.listList) {
            M.ViewManager.currentlyRenderedPage.listList = [];
        }
        M.ViewManager.currentlyRenderedPage.listList.push(this);

        if(this.hasSearchBar && !this.usesDefaultSearchBehaviour) {
            this.searchBar.isListViewSearchBar = YES;
            this.searchBar.listView = this;
            this.searchBar = M.SearchBarView.design(this.searchBar);
            this.html = this.searchBar.render();
        } else {
            this.html = '';
        }

        var listTagName = this.isNumberedList ? 'ol' : 'ul';
        this.html += '<' + listTagName + ' id="' + this.id +
            '" class="ui-listview ui-listview-inset ui-corner-all ui-shadow ui-listview-c"' +
            this.style() + '></' + listTagName + '>';

        return this.html;
    },

    /**
     * This method is responsible for registering events for view elements and its child views. It
     * basically passes the view's event-property to M.EventDispatcher to bind the appropriate
     * events.
     *
     * It extend M.View's registerEvents method with some special stuff for list views and their
     * internal events.
     */
    registerEvents: function() {
    },
    /**
     * This method adds a new list item to the list view by simply appending its html representation
     * to the list view inside the DOM. This method is based on jQuery's append().
     *
     * @param {String} item The html representation of a list item to be added.
     */
    addItem: function(item) {
        $('#' + this.id).append(item);
    },

    /**
     * This method removes all of the list view's items by removing all of its content in the DOM. This
     * method is based on jQuery's empty().
     */
    removeAllItems: function(elem) {
        if (elem==null) {elem = $('#'+this.id)[0];}
        $(elem).find('> li').each(function() {
            M.ViewManager.getViewById($(this).attr('id')).destroy(this);
        });
        $(elem).empty();
    },

        // MS -- override destroy to remove child-list-items
        destroy: function(elem) {
            if (!elem) {elem = $('#'+this.id)[0];}
            if (this.id) {
                this.removeAllItems(elem); // MS modification to destroy()
                var childViews = this.getChildViewsAsArray();
                for(var i in childViews) {
                    if(this[childViews[i]]) {
                        this[childViews[i]].destroy($(elem).find('#'+this[childViews[i]].id)[0]);
                    }
                }
                // M.EventDispatcher.unregisterEvents(this);
                M.ViewManager.unregister(this);
            }
            if(this.id && elem) {
                // MS modification to clear views from associated model
                // $('#' + this.id).remove();
                elem.parentNode.removeChild(elem);
            }
        },

    /**
     * Updates the the list view by re-rendering all of its child views, respectively its item views. There
     * is no rendering done inside this method itself. It is more like the manager of the rendering process
     * and delegates the responsibility to renderListItemDivider() and renderListItemView() based on the
     * given list view configuration.
     *
     * @private
     */
    renderUpdate: function(elem) {
        if(this.removeItemsOnUpdate) {
            this.removeAllItems(elem);
        }
        this.renderListItemView(elem);
    },


    /**
     * This method renders list items based on the passed parameters.
     *
     * @param {Array} content The list items to be rendered.
     * @param {M.ListItemView} templateView The template for for each list item.
     * @private
     */
    renderListItemView: function(elem) {
        /* Save this in variable that for later use within an other scope (e.g. _each()) */
        var that = this;
        _.each(this.value[this.items], function(item, index) {
            that.renderOneItem(that, item, index, elem);
        });
    },

    renderOneItem: function(parentView, model, index, parentElem) {
        /* Create a new object for the current template view */
        var templateView = parentView.listItemTemplateView;
        var obj = templateView.design({});
        obj.modelId = model.cid;
        obj = parentView.cloneObject(obj, model);
        //set the current list item value to the view value. This enables for example to get the value/contentBinding of a list item in a template view.
        obj.value = model;
        if (parentView.rootID) {
            obj.setRootID(parentView.rootID);
        }

        obj.modelType.findOrCreate(obj.modelId).addView(obj); // register view.id in model
        obj.parentView = parentView; // set list-view as view's parent

        if (parentElem==null) {
            parentElem = $('#'+parentView.id)[0];
        }
        if (!parentElem) {
            console.log("ERROR: parentElem doesn't exist in renderOneItem");
        }
        parentElem.appendChild($(obj.render())[0]);
        // this.addItem(obj.render()); // add to DOM
        var objElem = $(parentElem).find('#'+obj.id);

        obj.theme(objElem[0]);

        // corner-theming
        if (index===0) {
            objElem.addClass('ui-first-child');
        }
        if (index===parentView.value.models.length-1) {
            objElem.addClass('ui-last-child');
        }
        // MS -- render updated-content for any nested lists
        //    (must be after rendering/theming, above)
        obj.children.value = obj.value.attributes.children;
        // check outline and value for collapse-status
        var isCollapsed = obj.value.get('collapsed');

        var outline = diathink.OutlineManager.outlines[obj.rootID];
        var collapseTest = outline.getData(obj.value.cid);
        if (collapseTest != null) {
            isCollapsed = collapseTest;
        }
        if (isCollapsed) {
            objElem.addClass('branch').removeClass('leaf').
                addClass('collapsed').removeClass('expanded');
        } else {
            obj.children.renderUpdate();
            if (objElem.children('ul').children().length>0) {
                objElem.addClass('branch').removeClass('leaf').
                  addClass('expanded').removeClass('collapsed');
            } else {
                objElem.addClass('leaf').removeClass('branch').
                    addClass('expanded').removeClass('collapsed');
            }
        }
    },

    /**
     * This method clones an object of the template including its sub views (recursively).
     *
     * @param {Object} obj The object to be cloned.
     * @param {Object} item The current item (record/data).
     * @private
     */
    cloneObject: function(obj, item) {
        /* Get the child views as an array of strings */
        var childViewsArray = obj.childViews ? obj.getChildViewsAsArray() : [];

        var record = item.attributes; // For compatibility with Backbone.Model

        /* Iterate through all views defined in the template view */
        for(var i in childViewsArray) {
            /* Create a new object for the current view */
            obj[childViewsArray[i]] = obj[childViewsArray[i]].design({});

            /* create childViews of the current object */
            obj[childViewsArray[i]] = this.cloneObject(obj[childViewsArray[i]], item);

            /* This regex looks for a variable inside the template view (<%= ... %>) ... */
            var pattern = obj[childViewsArray[i]].computedValue ? obj[childViewsArray[i]].computedValue.valuePattern : obj[childViewsArray[i]].valuePattern;
            var regexResult = /<%=\s+([.|_|-|$|§|@|a-zA-Z0-9\s]+)\s+%>/.exec(pattern);

            /* ... if a match was found, the variable is replaced by the corresponding value inside the record */
            if(regexResult) {
                switch (obj[childViewsArray[i]].type) {
                    case 'M.LabelView':
                    case 'M.ButtonView':
                    case 'M.ImageView':
                    case 'M.TextEditView': // MS modification
                    case 'M.SpanView': // MS modification
                    case 'M.TextFieldView':
                        while(regexResult !== null) {
                            if(typeof(record[regexResult[1]]) === 'object') {
                                pattern = record[regexResult[1]];
                                regexResult = null;
                            } else {
                                pattern = pattern.replace(regexResult[0], record[regexResult[1]]);
                                regexResult = /<%=\s+([.|_|-|$|§|@|a-zA-Z0-9\s]+)\s+%>/.exec(pattern);
                            }
                        }
                        obj[childViewsArray[i]].value = pattern;
                        break;
                }
            }
        }
        obj.item = item;

        _.each(Object.keys(item), function(key){
            if(!obj.hasOwnProperty(key)){
                obj[key] = item[key];
            }
        });
        
        return obj;
    },

    /**
     * Triggers the rendering engine, jQuery mobile, to style the list view.
     *
     * @private
     */
    theme: function() {
    },

    /**
     * Triggers the rendering engine, jQuery mobile, to re-style the list view.
     *
     * @private
     */
    themeUpdate: function() {
    },

    fixTextHeights: function() {
        $('#' + this.id +' textarea').each(function() {
            M.ViewManager.getViewById(this.id).fixHeight();
        });
    },

    /**
     * This method activates a list item by applying the default 'isActive' css style to its
     * DOM representation.
     *
     * @param {String} listItemId The id of the list item to be set active.
     */
    setActiveListItem: function(listItemId, event, nextEvent) {
        /* if there is a swipe button visible, do nothing but hide that button */
        if(this.swipeButton) {
            this.hideSwipeButton();
            return;
        }

        if(this.selectedItem) {
            this.selectedItem.removeCssClass('ui-btn-active');
        }
        this.selectedItem = M.ViewManager.getViewById(listItemId);

        /* is the selection list items are selectable, activate the right one */
        if(!this.listItemTemplateView || (this.listItemTemplateView && this.listItemTemplateView.isSelectable)) {
            this.selectedItem.addCssClass('ui-btn-active');
        }

        /* delegate event to external handler, if specified */
        if(nextEvent) {
            M.EventDispatcher.callHandler(nextEvent, event, NO, [listItemId, this.selectedItem.modelId]);
        }
    },

    /**
     * This method resets the list by applying the default css style to its currently activated
     * list item.
     */
    resetActiveListItem: function() {
        if(this.selectedItem) {
            this.selectedItem.removeCssClass('ui-btn-active');
        }
    },

    /**
     * Applies some style-attributes to the list view.
     *
     * @private
     * @returns {String} The list's styling as html representation.
     */
    style: function() {
        var html = '';
        if(this.cssClass || this.doNotOverlapAtTop || this.doNotOverlapAtBottom) {
            html += ' class="'
                + (this.cssClass ? this.cssClass : '')
                + (!this.isInset && this.doNotOverlapAtTop ? ' listview-do-not-overlap-at-top' : '')
                + (!this.isInset && this.doNotOverlapAtBottom ? ' listview-do-not-overlap-at-bottom' : '')
                + '"';
        }
        return html;
    },

    removeListItem: function(id, event, nextEvent) {
        var modelId = M.ViewManager.getViewById(id).modelId;

        /* delegate event to external handler, if specified */
        if(nextEvent) {
            M.EventDispatcher.callHandler(nextEvent, event, NO, [id, modelId]);
        }
    },

    showSwipeButton: function(id, event, nextEvent) {
        var listItem = M.ViewManager.getViewById(id);

        /* reset the selection for better visual effect */
        this.resetActiveListItem();

        if(!listItem.swipeButton) {
            M.Logger.log('You need to specify a valid button with the \'swipeButton\' property of your list template!', M.WARN);
        } else {
            var previouslistItem = this.swipeButton ? this.swipeButton.parentView : null;

            if(previouslistItem) {
                this.hideSwipeButton();
            }

            if(!previouslistItem) {
                this.swipeButton = M.ButtonView.design(
                    listItem.swipeButton
                );
                this.swipeButton.value = this.swipeButton.value ? this.swipeButton.value : 'delete';
                this.swipeButton.parentView = M.ViewManager.getViewById(id);
                this.swipeButton.cssClass = this.swipeButton.cssClass ? this.swipeButton.cssClass + ' tmp-swipe-button' : 'a tmp-actionsheet-destructive-button tmp-swipe-button';
                this.swipeButton.value = this.swipeButton.value ? this.swipeButton.value : 'delete';
                this.swipeButton.internalEvents = {
                    tap: {
                        target: listItem,
                        action: 'swipeButtonClicked'
                    }
                };

                $('#' + id).append(this.swipeButton.render());
                this.swipeButton.theme();
                this.swipeButton.registerEvents();
                $('#' + this.swipeButton.id).css('height', 0.7 * $('#' + id).outerHeight());
                $('#' + this.swipeButton.id).css('top', Math.floor(0.15 * $('#' + id).outerHeight()));
                $('#' + id + '>div.ui-btn-inner').css('margin-right', parseInt($('#' + this.swipeButton.id).css('width')) + parseInt($('#' + this.swipeButton.id).css('right')));

                /* register tap/click for the page so we can hide the button again */
                var that = this;
                $('#' + M.ViewManager.getCurrentPage().id).bind('click tap', function() {
                    that.hideSwipeButton();
                });
            }
        }
    },

    hideSwipeButton: function() {
        $('#' + this.swipeButton.id).hide();
        $('#' + this.swipeButton.id).parent('li').find('div.ui-btn-inner').css('margin-right', 0);
        this.swipeButton = null;

        /* un-register tap/click for the page */
        $('#' + M.ViewManager.getCurrentPage().id).unbind('click tap');
    },

    /**
     * This method can be used to determine a list item view based on its id.
     *
     * Note: This is not the DOM id! If no special id was set with the list item's data, the index
     * of the item within the list is taken as reference id.
     *
     * @param {String, Number} modelId The id to determine the list item.
     */
    getListItemViewById: function(modelId) {
        // TODO: use model lookup instead of brute force
        var views = this.listItemTemplateView.modelType.findOrCreate(modelId).views;

        return views;

        for (var i in views) { // check view-id for inclusion in this view
            // TODO: what to do with this?
        }
        // which one is in our view?
        var item = _.detect(this.childViewObjects, function(item) {
            return item.modelId === modelId;
        });

        return item;
    },

    /**
     * This method can be used to silently update values within a single list item. Instead
     * of removing the whole item, only the desired sub views are updated.
     *
     * To determine which list item to update, pass the internal id of the item as the first
     * parameter.
     *
     * Note: This is not the DOM id! If no special id was set with the list item's data, the index
     * of the item within the list is taken as reference id.
     *
     * As second parameter pass an array containing objects that specify which sub view to
     * update (key) and which value to set (value), e.g.:
     *
     *     [
     *         {
     *             key: 'label1',
     *             value: 'new value',
     *         }
     *     ]
     *
     * @param {String, Number} modelId The id to determine the list item.
     * @param {Array} updates An array containing all updates.
     */
    updateListItemView: function(modelId, updates) {
        var item = this.getListItemViewById(modelId);

        if(!item) {
            M.Logger.log('No list item found with given id \'' + modelId + '\'.', M.WARN);
            return;
        }

        if(!(updates && typeof(updates) === 'object')) {
            M.Logger.log('No updates specified when calling \'updateListItemView\'.', M.WARN);
            return;
        }

        _.each(updates, function(update) {
            var view = M.ViewManager.getView(item, update['key']);

            if(view) {
                view.setValue(update['value']);
            } else {
                M.Logger.log('There is no view \'' + update['key'] + '\' available within the list item.', M.WARN);
            }
        });
    }

});
