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

m_require("app/foundation/view.js");

/**
 * @class
 *
 * M.ListView is the prototype of any list view. It is used to display static or dynamic
 * content as vertically aligned list items (M.ListItemView). A list view provides some
 * easy to use helper method, e.g. an out-of-the-box delete view for items.
 *
 * @extends M.View
 */
M.ListView = M.View.subclass(
/** @scope M.ListView.prototype */ {

    /**
     * The type of this object.
     *
     * @type String
     */
    type: 'M.ListView',

    removeItemsOnUpdate: YES,

    /**
     * The list view's items, respectively its child views.
     *
     * @type Array
     */
    items: null,

    listItemTemplateView: null,
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

    render: function() {
        /* add the list view to its surrounding page */


        if(!M.ViewManager.currentlyRenderedPage.listList) {
            M.ViewManager.currentlyRenderedPage.listList = [];
        }
        M.ViewManager.currentlyRenderedPage.listList.push(this);

        if(this.hasSearchBar && !this.usesDefaultSearchBehaviour) {
            this.searchBar.isListViewSearchBar = YES;
            this.searchBar.listView = this;
            this.searchBar = new M.SearchBarView(this.searchBar);
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

    addItem: function(item) {
        $('#' + this.id).append(item);
    },

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

    renderUpdate: function(elem) {
        if(this.removeItemsOnUpdate) {
            this.removeAllItems(elem);
        }
        this.renderListItemView(elem);
    },


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
        var obj = new templateView({});
        obj = parentView.cloneObject(obj, model);
        //set the current list item value to the view value. This enables for example to get the value/contentBinding of a list item in a template view.
        obj.value = model;
        if (parentView.rootID) {
            obj.setRootID(parentView.rootID);
        }

        obj.modelType.findOrCreate(obj.value.cid).addView(obj); // register view.id in model
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

        var outline = $D.OutlineManager.outlines[obj.rootID];
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

    cloneObject: function(obj, item) {
        /* Get the child views as an array of strings */
        var childViewsArray = obj.childViews ? obj.getChildViewsAsArray() : [];

        var record = item.attributes; // For compatibility with Backbone.Model

        /* Iterate through all views defined in the template view */
        for(var i in childViewsArray) {
            /* Create a new object for the current view */
            obj[childViewsArray[i]] = new obj[childViewsArray[i]];

            /* create childViews of the current object */
            obj[childViewsArray[i]] = this.cloneObject(obj[childViewsArray[i]], item);

            /* This regex looks for a variable inside the template view (<%= ... %>) ... */
            var pattern = obj[childViewsArray[i]].computedValue ? obj[childViewsArray[i]].computedValue.valuePattern : obj[childViewsArray[i]].valuePattern;
            var regexResult = /<%=\s+([.|_|-|$|§|@|a-zA-Z0-9\s]+)\s+%>/.exec(pattern);

            /* ... if a match was found, the variable is replaced by the corresponding value inside the record */
            if(regexResult) {
                switch (obj[childViewsArray[i]].type) {
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
        if(this.selectedItem) {
            this.selectedItem.removeCssClass('ui-btn-active');
        }
        this.selectedItem = M.ViewManager.getViewById(listItemId);

        /* is the selection list items are selectable, activate the right one */
        if(!this.listItemTemplateView || (this.listItemTemplateView && this.listItemTemplateView.isSelectable)) {
            this.selectedItem.addCssClass('ui-btn-active');
        }

    },

    resetActiveListItem: function() {
        if(this.selectedItem) {
            this.selectedItem.removeCssClass('ui-btn-active');
        }
    },

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
    }

});
