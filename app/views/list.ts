///<reference path="../foundation/view.ts"/>
///<reference path="../views/list_item.ts"/>
///<reference path="../views/OutlineView.ts"/>
m_require("app/foundation/view.js");
class ListView extends View {
    type = 'ListView';
    listItemTemplateView:any;
    removeItemsOnUpdate:boolean = YES;
    isInset:boolean = NO;
    doNotOverlapAtTop:boolean = NO;
    doNotOverlapAtBottom:boolean = NO;
    render() {
        this.html = '';
        var listTagName = 'ul';
        this.html += '<' + listTagName + ' id="' + this.id +
            '" class="ui-listview ui-listview-inset ui-corner-all ui-shadow ui-listview-c"' +
            this.style() + '></' + listTagName + '>';
        return this.html;
    }

    removeAllItems(elem) {
        if (elem == null) {
            elem = $('#' + this.id)[0];
        }
        $(elem).find('> li').each(function() {
            View.get($(this).attr('id')).destroy(this);
        });
        $(elem).empty();
    }

    // MS -- override destroy to remove child-list-items
    destroy(elem):any {
        if (!elem) {
            elem = $('#' + this.id)[0];
        }
        if (this.id) {
            this.removeAllItems(elem); // MS modification to destroy()
            for (var v in this.childViewTypes) {
                if (this.childViewTypes.hasOwnProperty(v)) {
                    var child:View = this[v];
                    if (child) {
                        child.destroy($(elem).find('#' + child.id)[0]);
                    }
                }
            }
            // M.EventDispatcher.unregisterEvents(this);
            View.unregister(this);
        }
        if (this.id && elem) {
            // MS modification to clear views from associated model
            // $('#' + this.id).remove();
            elem.parentNode.removeChild(elem);
        }
    }

    renderUpdate(elem) {
        if (this.removeItemsOnUpdate) {
            this.removeAllItems(elem);
        }
        this.renderListItemView(elem);
    }

    renderListItemView(elem) {
        /* Save this in variable that for later use within an other scope (e.g. _each()) */
        var that = this;
        _.each(this.value[this.items], function(item, index) {
            that.renderOneItem(that, item, index, elem);
        });
    }

    renderOneItem(parentView, model, index, parentElem) {
        /* Create a new object for the current template view */
        var templateView = parentView.listItemTemplateView;
        var obj:MyListItem = new templateView({});
        obj.setValuePatterns(model);
        obj.value = model;

        //set the current list item value to the view value. This enables for example to get the value/contentBinding of a list item in a template view.
        if (parentView.rootID) {
            obj.setRootID(parentView.rootID);
        }
        obj.modelType.findOrCreate(obj.value.cid).addView(obj); // register view.id in model
        obj.parentView = parentView; // set list-view as view's parent
        if (parentElem == null) {
            parentElem = $('#' + parentView.id)[0];
        }
        if (!parentElem) {
            console.log("ERROR: parentElem doesn't exist in renderOneItem");
        }
        parentElem.appendChild($(obj.render())[0]);


        // handle list-item theming
        var objElem = $(parentElem).find('#' + obj.id);
        obj.theme(objElem[0]);
        // corner-theming
        if (index === 0) {
            objElem.addClass('ui-first-child');
        }
        if (index === parentView.value.models.length - 1) {
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
            obj.children.renderUpdate(null);
            if (objElem.children('ul').children().length > 0) {
                objElem.addClass('branch').removeClass('leaf').
                    addClass('expanded').removeClass('collapsed');
            } else {
                objElem.addClass('leaf').removeClass('branch').
                    addClass('expanded').removeClass('collapsed');
            }
        }
    }

    theme() {
    }

    themeUpdate() {
    }

    fixTextHeights() {
        $('#' + this.id + ' textarea').each(function() {
            View.get(this.id).fixHeight();
        });
    }

    style() {
        var html = '';
        if (this.cssClass || this.doNotOverlapAtTop || this.doNotOverlapAtBottom) {
            html += ' class="'
                + (this.cssClass ? this.cssClass : '')
                + (!this.isInset && this.doNotOverlapAtTop ? ' listview-do-not-overlap-at-top' : '')
                + (!this.isInset && this.doNotOverlapAtBottom ? ' listview-do-not-overlap-at-bottom' : '')
                + '"';
        }
        return html;
    }
}
