// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: (c) 2010 M-Way Solutions GmbH. All rights reserved.
//            (c) 2011 panacoda GmbH. All rights reserved.
// Creator:   Dominik
// Date:      26.10.2010
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

m_require('core/foundation/model.js');

/**
 * @class
 *
 * M.View defines the prototype for any view within The M-Project. It implements lots of basic
 * properties and methods that are used in many derived views. M.View specifies a default
 * behaviour for functionalities like rendering, theming, delegating updates etc.
 *
 * @extends M.Object
 */


M.View = $D.Object.subclass({

    type: 'M.View',
    isView: YES,
    value: null,
    childViews: null,
    hasFocus: NO,
    id: null,

    computedValue: null,
    contentBinding: null,
    contentBindingReverse: null,
    valueBinding: null,
    isInline: NO, // labelview or buttonview
    isEnabled: YES,
    parentView: null,
    modelId: null,
    cssClass: null,
    cssStyle: null,
    cssClassOnError: null, // textfieldview
    cssClassOnInit: null, // textfieldview
    html: '',
    triggerActionOnChange: NO,
    triggerActionOnKeyUp: NO,
    triggerActionOnEnter: NO,
    events: null,
    internalEvents: null,
    recommendedEvents: null,
    parentPage : null,

    childrenArray: false,
    elem: null,
    rootID: null, // MS which view's controller is in charge of outline-contents

    constructor: function(obj) {
            if ((obj===undefined) || (obj.id === undefined)) {
            this.id = M.ViewManager.getNextId();
        } else { // validate it's not being used
            $D.assert($D(obj.id) == null, "Duplicate id specified in view constructor");
        }
        _.extend(this, obj);

        M.ViewManager.register(this);
        this.onDesign();
        if (this.isTemplate) {
            // if children are not yet instantiated, so instantiate them here
            var childViews = this.getChildViewsAsArray();
            for(var i in childViews) {
                this[childViews[i]].prototype.isTemplate = true;
                this[childViews[i]].prototype.parentView = this;
                this[childViews[i]] = new this[childViews[i]];
            }
        }

        this.attachToObservable();
    },
    create: function() {
        this.createChildren();
    },
    createChildren: function() {
        // handle child contexts

        if (this.isList) {
            // check value
        }
        if(this.childViews) {
            var childViews = this.getChildViewsAsArray();
            for(var i in childViews) {
                if(this[childViews[i]]) {
                    this[childViews[i]]._name = childViews[i];
                    this[childViews[i]].parentView = this;
                    this.html += this[childViews[i]].render();
                } else {
                    this.childViews = this.childViews.replace(childViews[i], ' ');
                    M.Logger.log('There is no child view \'' + childViews[i] + '\' available for ' + this.type + ' (' + (this._name ? this._name + ', ' : '') + '#' + this.id + ')! It will be excluded from the child views and won\'t be rendered.', M.WARN);
                }

                if(this.type === 'M.PageView' && this[childViews[i]].type === 'M.TabBarView') {
                    this.hasTabBarView = YES;
                    this.tabBarView = this[childViews[i]];
                }
            }
            return this.html;
        }
    },
    insertAt: function(context) {

    },
    detach: function() {

    },
    destroy: function(elem) {
        if(this.id) {
            if (!elem) {elem = $('#'+this.id)[0];}
            var childViews = this.getChildViewsAsArray();
            for(var i in childViews) {
                if(this[childViews[i]]) {
                    if (elem) {
                        this[childViews[i]].destroy($(elem).find('#'+this[childViews[i]].id)[0]);
                    } else {
                        this[childViews[i]].destroy();
                    }
                }
            }
            if (elem) {
                $(elem).remove();
            }
            M.EventDispatcher.unregisterEvents(this);
            M.ViewManager.unregister(this);
        }
    },

    detachContentBinding: function(){
        if( this.contentBinding && this.contentBinding.target && this.contentBinding.target.observable && this.contentBinding.property){
            this.contentBinding.target.observable.detach(this.contentBinding.property);
        }
        if( this.valueBinding    && this.valueBinding.target    && this.valueBinding.target.observable    && this.valueBinding.property){
            this.valueBinding.target.observable.detach(this.valueBinding.property);
        }
    },

/*
        designWithID: function(obj) {
            var classtype = this;
            if (obj != null) {classtype = this.subclass(obj);}
            if (!obj.id || M.ViewManager.getViewById(obj.id)) {
                console.log('Invalid object id for designWithID');
                debugger;
            }
            var view = this.extend(obj);
            view.id = obj.id;
            M.ViewManager.register(view);
            view.onDesign();
            if (this.isTemplate) {
                // design children too
                var childViews = view.getChildViewsAsArray();
                for(var i in childViews) {
                    view[childViews[i]].isTemplate = true;
                    view[childViews[i]].parentView = view;
                    view[childViews[i]] = new view[childViews[i]];
                }
            }

            view.attachToObservable();

            return view;
        },
        */
    onDesign: function() {
        // place-holder function for any instantiation
    },

    render: function() {
        this.renderChildViews();
        return this.html;
    },

    /**
     * @interface
     *
     * This method defines an interface method for updating an already rendered html representation
     * of a view. This should be implemented with a specific behaviour for any view.
     */
    renderUpdate: function() {

    },

    renderChildViews: function() {
        if(this.childViews) {
            var childViews = this.getChildViewsAsArray();
            for(var i in childViews) {
                if(this[childViews[i]]) {
                    this[childViews[i]]._name = childViews[i];
                    this[childViews[i]].parentView = this;
                    this.html += this[childViews[i]].render();
                } else {
                    this.childViews = this.childViews.replace(childViews[i], ' ');
                    M.Logger.log('There is no child view \'' + childViews[i] + '\' available for ' + this.type + ' (' + (this._name ? this._name + ', ' : '') + '#' + this.id + ')! It will be excluded from the child views and won\'t be rendered.', M.WARN);
                }

                if(this.type === 'M.PageView' && this[childViews[i]].type === 'M.TabBarView') {
                    this.hasTabBarView = YES;
                    this.tabBarView = this[childViews[i]];
                }
            }
            return this.html;
        }
    },


    getChildViewsAsArray: function() {
    	try{
    	    return this.childViews ? $.trim(this.childViews.replace(/\s+/g, ' ')).split(' ') : [];
    	} catch(e){
    	    return [];
    	}
    },

    /**
     * This method creates and returns an associative array of all child views and
     * their values.
     *
     * The key of an array item is the name of the view specified in the view
     * definition. The value of an array item is the value of the corresponding
     * view.
     *
     * @returns {Array} The child view's values as an array.
     */
    getValues: function() {
        var values = {};
        if(this.childViews) {
            var childViews = this.getChildViewsAsArray();
            for(var i in childViews) {
                if(Object.getPrototypeOf(this[childViews[i]]).hasOwnProperty('getValue')) {
                    values[childViews[i]] = this[childViews[i]].getValue();
                }
                if(this[childViews[i]].childViews) {
                    var newValues = this[childViews[i]].getValues();
                    for(var value in newValues) {
                        values[value] = newValues[value];
                    }
                }
            }
        }
        return values;
    },

    /**
     * @interface
     *
     * This method defines an interface method for getting the view's value. This should
     * be implemented for any view that offers a value and can be used within a form view.
     */
    getValue: function() {
        
    },

    /**
     * This method creates and returns an associative array of all child views and
     * their ids.
     *
     * The key of an array item is the name of the view specified in the view
     * definition. The value of an array item is the id of the corresponding
     * view.
     *
     * @returns {Array} The child view's ids as an array.
     */
    getIds: function() {
        var ids = {};
        if(this.childViews) {
            var childViews = this.getChildViewsAsArray();
            for(var i in childViews) {
                if(this[childViews[i]].id) {
                    ids[childViews[i]] = this[childViews[i]].id;
                }
                if(this[childViews[i]].childViews) {
                    var newIds = this[childViews[i]].getIds();
                    for(var id in newIds) {
                        ids[id] = newIds[id];
                    }
                }
            }
        }
        return ids;
    },


    /**
     * Clears the html property of a view and triggers the same method on all of its
     * child views.
     */
    clearHtml: function() {
        this.html = '';
        if(this.childViews) {
            var childViews = this.getChildViewsAsArray();
            for(var i in childViews) {
                this[childViews[i]].clearHtml();
            }
        }
    },

    /**
     * If the view's computedValue property is set, compute the value. This allows you to
     * apply a method to a dynamically set value. E.g. you can provide your value with an
     * toUpperCase().
     */
    computeValue: function() {
        if(this.computedValue) {
            this.value = this.computedValue.operation(this.computedValue.valuePattern ? this.value : this.computedValue.value, this);
        }
    },

    /**
     * This method is a basic implementation for theming a view. It simply calls the
     * themeChildViews method. Most views overwrite this method with a custom theming
     * behaviour.
     */
    theme: function(elem) {
        this.themeChildViews(elem);
    },

    /**
     * This method is responsible for registering events for view elements and its child views. It
     * basically passes the view's event-property to M.EventDispatcher to bind the appropriate
     * events.
     */
    registerEvents: function() {
        var externalEvents = {};
        for(var event in this.events) {
            /* map orientationchange event to orientationdidchange event */
            if(event === 'orientationchange') {
                event = 'orientationdidchange';
            }
            externalEvents[event] = this.events[event];
        }

        if(this.internalEvents) {
            for(var event in this.internalEvents) {
                /* map orientationchange event to orientationdidchange event */
                if(this.internalEvents[event]) {
                    if(event === 'orientationchange') {
                        this.internalEvents['orientationdidchange'] = this.internalEvents[event];
                        delete this.internalEvents[event];
                    }
                }
            }
        }

        if(this.internalEvents && externalEvents) {
            for(var event in externalEvents) {
                if(this.internalEvents[event]) {
                    this.internalEvents[event].nextEvent = externalEvents[event];
                    delete externalEvents[event];
                }
            }
            M.EventDispatcher.registerEvents(this.id, this.internalEvents, this.recommendedEvents, this.type);
        } else if(this.internalEvents) {
            M.EventDispatcher.registerEvents(this.id, this.internalEvents, this.recommendedEvents, this.type);
        }

        if(externalEvents) {
            M.EventDispatcher.registerEvents(this.id, externalEvents, this.recommendedEvents, this.type);
        }
        
        if(this.childViews) {
            var childViews = this.getChildViewsAsArray();
            for(var i in childViews) {
                this[childViews[i]].registerEvents();
            }
        }
    },

    saveContext: function(elem) {
        if (!elem) {elem = $('#'+this.id)[0];}
        if (!elem) {return null;}
        return {
            prev: elem.previousSibling,
            next: elem.nextSibling,
            parent: elem.parentNode
        };
    },
    validateContext: function(context) {
        if (!context.parent) {
            debugger;
            return;
        }
        if (context.prev) {
            if (context.prev.parentNode !== context.parent) {
                debugger;
                return;
            }
            if (context.prev.nextSibling !== context.next) {
                debugger;
                return;
            }
        }
        if (context.next) {
            if (context.next.parentNode !== context.parent) {
                debugger;
                return;
            }
            if (context.next.previousSibling !== context.prev) {
                debugger;
                return;
            }
        }
    },
    renderAt: function(context) {
      this.validateContext(context);
      if (context.prev) {
          return $(context.prev).after(this.render());
      } else if (context.next) {
          return $(context.next).before(this.render());
      } else {
          return $(context.parent).prepend(this.render());
      }
    },

    /**
     * This method triggers the theme method on all children.
     */
    themeChildViews: function(elem) {
        if (!elem) {elem = $('#'+this.id)[0];}
        if(this.childViews) {
            var childViews = this.getChildViewsAsArray();
            for(var i in childViews) {
                this[childViews[i]].theme($(elem).find('#'+this[childViews[i]].id)[0]);
            }
        }
    },

    /**
     * The contentDidChange method is automatically called by the observable when the
     * observable's state did change. It then updates the view's value property based
     * on the specified content binding.
     */
    contentDidChange: function(){
        var contentBinding = this.contentBinding ? this.contentBinding : (this.computedValue) ? this.computedValue.contentBinding : null;

        if(!contentBinding) {
            return;
        }

        var value = contentBinding.target;
        var propertyChain = contentBinding.property.split('.');
        _.each(propertyChain, function(level) {
            if(value) {
                value = value[level];
            }
        });

        if(value === undefined || value === null) {
            M.Logger.log('The value assigned by content binding (property: \'' + contentBinding.property + '\') for ' + this.type + ' (' + (this._name ? this._name + ', ' : '') + '#' + this.id + ') is invalid!', M.WARN);
            return;
        }

        if(this.contentBinding) {
            this.value = value;
        } else if(this.computedValue.contentBinding) {
            this.computedValue.value = value;
        }

        this.renderUpdate();
        this.delegateValueUpdate();
    },

    /**
     * This method attaches the view to an observable to be later notified once the observable's
     * state did change.
     */

    attachToObservable: function() {
        this.registerContentBinding();
        this.registervalueBinding();
    },

    registervalueBinding:function () {
        var valueBinding = this.valueBinding ? this.valueBinding : (this.computedValue) ? this.computedValue.valueBinding : null;
        if(!valueBinding) { return; }
        this.attachBinding(valueBinding, 'valueBinding');
    },

    registerContentBinding: function(){
        var contentBinding = this.contentBinding ? this.contentBinding : (this.computedValue) ? this.computedValue.contentBinding : null;
        if(!contentBinding) { return; }
        this.attachBinding(contentBinding, 'contentBinding');
    },

    attachBinding: function(binding, name) {
        if(!binding) {
            return;
        }

        if(typeof(binding) === 'object') {
            if(binding.target && typeof(binding.target) === 'object') {
                if(binding.property && typeof(binding.property) === 'string') {
                    var propertyChain = binding.property.split('.');
                    if(binding.target[propertyChain[0]] !== undefined) {
                        if(!binding.target.observable) {
                            binding.target.observable = M.Observable.extend({});
                        }
                        binding.target.observable.attach(this, binding.property);
                        this.isObserver = YES;
                    } else {
                        M.Logger.log('The specified target for ' + name + ' for \'' + this.type + '\' (' + (this._name ? this._name + ', ' : '') + '#' + this.id + ')\' has no property \'' + binding.property + '!', M.WARN);
                    }
                } else {
                    M.Logger.log('The type of the value of \'action\' in ' + name + ' for \'' + this.type + '\' (' + (this._name ? this._name + ', ' : '') + '#' + this.id + ')\' is \'' + typeof(binding.property) + ' but it must be of type \'string\'!', M.WARN);
                }
            } else {
                M.Logger.log('No valid target specified in ' + name + ' \'' + this.type + '\' (' + (this._name ? this._name + ', ' : '') + '#' + this.id + ')!', M.WARN);
            }
        } else {
            M.Logger.log('No valid ' + name + ' specified for \'' + this.type + '\' (' + (this._name ? this._name + ', ' : '') + '#' + this.id + ')!', M.WARN);
        }
    },

    /**
     * @interface
     * 
     * This method defines an interface method for setting the view's value from its DOM
     * representation. This should be implemented with a specific behaviour for any view.
     */
    setValueFromDOM: function() {

    },

    /**
     * This method delegates any value changes to a controller, if the 'contentBindingReverse'
     * property is specified.
     */
    delegateValueUpdate: function() {
        /**
         * delegate value updates to a bound controller, but only if the view currently is
         * the master
         */
        if(this.contentBindingReverse && this.hasFocus) {
            this.contentBindingReverse.target.set(this.contentBindingReverse.property, this.value);
        }
    },

    /**
     * @interface
     *
     * This method defines an interface method for styling the view. This should be
     * implemented with a specific behaviour for any view.
     */
    style: function() {

    },

    /**
     * This method is called whenever the view got the focus and basically only sets
     * the view's hasFocus property to YES. If a more complex behaviour is desired,
     * a view has to overwrite this method.
     */
    gotFocus: function() {
        this.hasFocus = YES;
    },

    /**
     * This method is called whenever the view lost the focus and basically only sets
     * the view's hasFocus property to NO. If a more complex behaviour is desired,
     * a view has to overwrite this method.
     */
    lostFocus: function() {
        this.hasFocus = NO;
    },

    /**
     * This method secure the passed string. It is mainly used for securing input elements
     * like M.TextFieldView but since it is part of M.View it can be used and called out
     * of any view.
     *
     * So far we only replace '<' and '>' with their corresponding html entity. The functionality
     * of this method will be extended in the future. If a more complex behaviour is desired,
     * any view using this method has to overwrite it.
     *
     * @param {String} str The string to be secured.
     * @returns {String} The secured string.
     */
    secure: function(str) {
        return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },

    /**
     * This method parses a given string, replaces any new line, '\n', with a line break, '<br/>',
     * and returns the modified string. This can be useful especially for input views, e.g. it is
     * used in context with the M.TextFieldView.
     *
     * @param {String} str The string to be modified.
     * @returns {String} The modified string.
     */
    nl2br: function(str) {
        if(str) {
            if(typeof(str) !== 'string') {
                str = String(str);
            }
            return str.replace(/\n/g, '<br />');
        }
        return str;
    },

    /**
     * This method parses a given string, replaces any tabulator, '\t', with four spaces, '&#160;',
     * and returns the modified string. This can be useful especially for input views, e.g. it is
     * used in context with the M.TextFieldView.
     *
     * @param {String} str The string to be modified.
     * @returns {String} The modified string.
     */
    tab2space: function(str) {
        if(str) {
            if(typeof(str) !== 'string') {
                str = String(str);
            }
            return str.replace(/\t/g, '&#160;&#160;&#160;&#160;');
        }
        return str;
    },

    /**
     * @interface
     *
     * This method defines an interface method for clearing a view's value. This should be
     * implemented with a specific behaviour for any input view. This method defines a basic
     * functionality for clearing a view's value. This should be overwritten with a specific
     * behaviour for most input view. What we do here is nothing but to call the cleaValue
     * method for any child view.
     */
    clearValue: function() {

    },

    /**
     * This method defines a basic functionality for clearing a view's value. This should be
     * overwritten with a specific behaviour for most input view. What we do here is nothing
     * but to call the cleaValue method for any child view.
     */
    clearValues: function() {
        if(this.childViews) {
            var childViews = this.getChildViewsAsArray();
            for(var i in childViews) {
                if(this[childViews[i]].childViews) {
                    this[childViews[i]].clearValues();
                }
                if(typeof(this[childViews[i]].clearValue) === 'function'){
                    this[childViews[i]].clearValue();
                }
            }
        }
        this.clearValue();
    },

    /**
     * Adds a css class to the view's DOM representation.
     *
     * @param {String} cssClass The css class to be added.
     */
    addCssClass: function(cssClass) {
        $('#' + this.id).addClass(cssClass);
    },

    /**
     * Removes a css class to the view's DOM representation.
     *
     * @param {String} cssClass The css class to be added.
     */
    removeCssClass: function(cssClass) {
        $('#' + this.id).removeClass(cssClass);
    },

    /**
     * Adds or updates a css property to the view's DOM representation.
     *
     * @param {String} key The property's name.
     * @param {String} value The property's value.
     */
    setCssProperty: function(key, value) {
        $('#' + this.id).css(key, value);
    },

    /**
     * Removes a css property from the view's DOM representation.
     *
     * @param {String} key The property's name.
     */
    removeCssProperty: function(key) {
        this.setCssProperty(key, '');
    },
	/**
     *
     * returns the page on which the current view is defined
     *
      * @return {*} M.PageView
     */
    getParentPage: function(){
        if(this.parentPage){
            return this.parentPage;
        }else{
            if(this.type === 'M.PageView'){
                return this;
            }else if(this.parentView){
                this.parentPage = this.parentView.getParentPage();
            }else{
                var parentId = $('#' + this.id).parent().closest('[id^=m_]').attr('id');
                if(parentId){
                    this.parentPage = M.ViewManager.getViewById(parentId).getParentPage();
                }
            }
            return this.parentPage;
        }
    },
    
    /*
    * find all childviews to the given string
    *
    * @param {String} childName the name of the child view looking for.
    * @param {Boolean} deepSearch look also in all childViews for the one.
    * @return {Array} all found childViews
    * 
    */
    findChildViews: function( childName, deepSearch ) {
    	var that = this;
        var childViews = this.getChildViewsAsArray();
        var foundChildren = [];
        _.each(childViews, function( child ) {
            if( child === childName ) {
                foundChildren.push(that[child]);
            }
        });

        if( deepSearch ) {
            _.each(childViews, function( child ) {
                foundChildren.push.apply(foundChildren, that[child].findChildViews(childName, deepSearch));
            });
        }

        return foundChildren;
    },

        // set rootID for all list-items within this list, recursively
        setRootID: function(id) {
            if (!id) {id = this.id;}
            if (this.rootID && (this.rootID===this.id) && (this.id!==id)) {
                // do not change RootID if this is a controlled-node
                return;
            }
            this.rootID = id;
            if ((this.type === 'M.ListView')&&(this.value)) {
                var itemlist = this.value[this.items];
                _.each(itemlist, function(item, index) {
                    item.setRootID(id);
                });
            }
            var childViewsArray = this.getChildViewsAsArray();
            for (var i in childViewsArray) {
                this[childViewsArray[i]].setRootID(id);
            }
        }
	
});
