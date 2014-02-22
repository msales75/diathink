
m_require('app/foundation/object.js');


M.View = $D.Object.subclass({

    type: 'M.View',
    isView: YES,
    value: null,
    childViews: null,
    hasFocus: NO,
    id: null,

    computedValue: null,
    // contentBinding: null,
    // contentBindingReverse: null,
    // valueBinding: null,
    isInline: NO, // labelview or buttonview
    // isEnabled: YES,
    parentView: null,
    // modelId: null,
    cssClass: null,
    cssClassOnError: null, // textfieldview
    cssClassOnInit: null, // textfieldview
    html: '',
    // triggerActionOnChange: NO,
    // triggerActionOnKeyUp: NO,
    // triggerActionOnEnter: NO,
    // events: null,
    // internalEvents: null,
    // recommendedEvents: null,
    // parentPage : null,

    childrenArray: false,
    elem: null,
    rootID: null, // MS which view's controller is in charge of outline-contents

    // isOutlineNode: false, // same as type==ListItemView
    // isOutlineRoot: false, // with rootID=.rootID
    // isPanelOutline: false, // special kind of type?
    // isPanel: false, // type Panel
    isDraggable: false,
    isClickable: false,
    isDoubleClickable: false,
    isFocusable: false, // todo: node vs. textarea
    isSwipable: false,
    isScrollport: false, // type scroll?
    // droppable is defined in view.dropboxes
    dropboxes: [], // places to drop objects in drag-mode

    constructor: function(obj) {
            if ((obj===undefined) || (obj.id === undefined)) {
            this.id = M.ViewManager.getNextId();
        } else { // validate it's not being used
            M.test(M.ViewManager.getViewById(obj.id) == null, "Duplicate id specified in view constructor");
        }
        _.extend(this, obj);

        M.ViewManager.register(this);
        this.onDesign();
        if (this.isTemplate) {
            // if children are not yet instantiated, so instantiate them here
            var childViews = this.getChildViewsAsArray();
            for(var i in childViews) {
                this[childViews[i]] = new this[childViews[i]]({
                    isTemplate: true,
                    parentView: this
                });
            }
        } else {
            for(var i in childViews) {
                this[childViews[i]].parentView = this;
            }
        }
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
            M.ViewManager.unregister(this);
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

    getValue: function() {
        
    },

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


    clearHtml: function() {
        this.html = '';
        if(this.childViews) {
            var childViews = this.getChildViewsAsArray();
            for(var i in childViews) {
                this[childViews[i]].clearHtml();
            }
        }
    },

    computeValue: function() {
        if(this.computedValue) {
            this.value = this.computedValue.operation(this.computedValue.valuePattern ? this.value : this.computedValue.value, this);
        }
    },

    theme: function(elem) {
        this.themeChildViews(elem);
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

    themeChildViews: function(elem) {
        if (!elem) {elem = $('#'+this.id)[0];}
        if(this.childViews) {
            var childViews = this.getChildViewsAsArray();
            for(var i in childViews) {
                this[childViews[i]].theme($(elem).find('#'+this[childViews[i]].id)[0]);
            }
        }
    },


    setValueFromDOM: function() {

    },

    style: function() {

    },

    gotFocus: function() {
        this.hasFocus = YES;
    },

    lostFocus: function() {
        this.hasFocus = NO;
    },

    secure: function(str) {
        return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },

    nl2br: function(str) {
        if(str) {
            if(typeof(str) !== 'string') {
                str = String(str);
            }
            return str.replace(/\n/g, '<br />');
        }
        return str;
    },

    tab2space: function(str) {
        if(str) {
            if(typeof(str) !== 'string') {
                str = String(str);
            }
            return str.replace(/\t/g, '&#160;&#160;&#160;&#160;');
        }
        return str;
    },

    addCssClass: function(cssClass) {
        $('#' + this.id).addClass(cssClass);
    },

    removeCssClass: function(cssClass) {
        $('#' + this.id).removeClass(cssClass);
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
