///<reference path="../views/View.ts"/>
///<reference path="../actions/ActionManager.ts"/>
///<reference path="../PanelManager.ts"/>

interface DragStartI {
    view: View;
    pos: PositionI;
    time: number;
    elem: HTMLElement;
}


interface TempItem {
    id:string;
    item:JQuery;
    dropboxes:DropBox[];
}
interface DropBox {
    type:string;
    elem:JQuery;
    parentView:NodeView;
    item:TempItem;
    top:Number;
    bottom:Number;
    left:Number;
    right:Number;
}

interface OffsetNested {
    left:number;
    top: number;
    click?:PositionI;
    relative?:PositionI;
    parent?:PositionI;
}

class DragHandler {

    element:JQuery; // set to body; phasing out
    options; // phase out

    currentItem:JQuery; // change to a View
      margins:PositionI; // of currentItem; replace with view

    panels:JQuery; // use panel-manager
    items; // tricky: need a node-manager; list of views

    scrollPanel:JQuery; // should be scrollview
      panelScrollStart:{[id:string]:number}; // get from scrollview

    helper:JQuery;
    helperProportions:Dimensions; // replace with cache in helper-view

    offsetParent:JQuery; // view?

    originalPosition:PositionI; // from mousedown
    originalPageX:number; // redundant, phase out
    originalPageY:number; // redundant, phase out

    position:PositionI;
    positionAbs:PositionI;

    activeBox:DropBox;
    hoveringBox:DropBox;

    hovering:number; // left over from something
    reverting:boolean; // ideally don't call dragStart at all

    offset:OffsetNested;

    constructor(options?) {
        this.element = $(document.body);
        this.options = {
            items: 'li',
            scroll: true,
            dropLayers: '.droplayer',
            toleranceElement: '> div.outline-header',
            helper: function(item) {
                var newNode:HTMLElement = <HTMLElement> item[0].cloneNode(true);
                newNode.id = '';
                var drawlayer = $('#' + (<DiathinkView>View.getCurrentPage()).drawlayer.id);
                drawlayer[0].appendChild(newNode);
                return $(newNode).css({
                    position: 'absolute',
                    left: $(item).offset().left + 'px',
                    top: $(item).offset().top + 'px'
                });
            }
        };
        if ($D.keyboard) {
            // override open/close keyboard methods
            $D.keyboard.softKeyboardOpen = this.softKeyboardOpen;
            $D.keyboard.softKeyboardClose = this.softKeyboardClose;
        }
        // todo: connect to panel-manager
        this.refresh();
        this.offset = <OffsetNested>this.element.offset();
    }

    dragStart(options:DragStartI) {
        var position:PositionI = options.pos;
        var currentView:NodeView = options.view.nodeView;
        this.currentItem = $(currentView.elem);
        var that = this;
        this.panelScrollStart = {};
        var textid = currentView.header.name.text.id;
        // Correct the active textbox in case it doesn't match value.
        $('#' + textid).text($('#' + textid).val());
        ActionManager.schedule(
            function() {
                return Action.checkTextChange(textid);
            });
        //We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
        this.refresh();
        //Create and append the visible helper
        this.helper = this._createHelper();
        //Cache the helper size
        this._cacheHelperProportions();
        /*
         * - Position generation -
         * This block generates everything position related - it's the core of draggables.
         */
        //Cache the margins of the original element
        this._cacheMargins();
        //The element's absolute position on the page minus margins
        this.offset = <PositionI> this.currentItem.offset();
        this.offset = <PositionI>{
            top: this.offset.top - this.margins.top,
            left: this.offset.left - this.margins.left
        };
        $.extend(this.offset, {
            click: { //Where the click happened, relative to the element
                left: position.left - this.offset.left,
                top: position.top - this.offset.top
            },
            parent: this._getParentOffset(),
            relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
        });
        // Only after we got the offset, we can change the helper's position to absolute
        // TODO: Still need to figure out a way to make relative sorting possible
        this.helper.css("position", "absolute");
        //Generate the original position
        this.originalPosition = this._generatePosition(position);
        this.originalPageX = position.left;
        this.originalPageY = position.top;
        //If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
        if (this.helper[0] != this.currentItem[0]) {
            this.currentItem.addClass('drag-hidden');
        }
        //Recache the helper size
        this._cacheHelperProportions();
        this.helper.addClass("ui-sortable-helper");
        this.dragMove(options); //Execute the drag once - this causes the helper not to be visible before getting its correct position
        this._drawDropLines();
    }

    dragMove(options:DragStartI) {
        var i, item, itemElement, intersection,
            scrolled = false, self = this;
        var position = options.pos;
        //Compute the helpers position
        // relative to 'offsetParent' which is the nearest relative/absolute positioned element
        // todo: these come from sortable.js
        this.position = this._generatePosition(position);
        this.positionAbs = this._convertPositionTo("absolute");
        // define this.overflowOffset (done in _mouseStart)
        // todo: do we need to update boxes more often when scrolling?
        // todo: loop over panels first, then items by-panel second?
        // for now, just loop over panels independently
        //Set the helper position
        if (!this.options.axis || this.options.axis !== "y") {
            this.helper[0].style.left = this.position.left + "px";
        }
        if (!this.options.axis || this.options.axis !== "x") {
            this.helper[0].style.top = this.position.top + "px";
        }
        if (this.scrollPanel) {
            var left = this.scrollPanel.offset().left;
            var right = left + this.scrollPanel.width();
            if (!(this.positionAbs.left >= left && this.positionAbs.left <= right)) {
                this.scrollPanel = null;
                console.log("Clearing scrollPanel");
            }
        }
        if (!this.scrollPanel) {
            this.panels.each(function() {
                var left = $(this).offset().left;
                var right = left + $(this).width();
                if (self.positionAbs.left >= left && self.positionAbs.left <= right) {
                    self.scrollPanel = $(this);
                    console.log("Changing scrollPanel to " + this.id);
                    // console.log(self.scrollPanel);
                }
            });
        }
        // todo: initialize lists for each panel - outside nestedSortable?
        if (this.scrollPanel) {
            // do we need to initialize the panel?
            var panelid = this.scrollPanel.attr('id');
            if (this.panelScrollStart[panelid] === undefined) {
                this.panelScrollStart[panelid] = (<ScrollView>View.get(this.scrollPanel.attr('id'))).scrollHandler.getScrollPosition().y;
            }
            // todo: add constraint?: for later panels, could scroll-position be different than the
            // scroll-position at mouse-start, which is where items are last updated?
            (<ScrollView>View.get(this.scrollPanel.attr('id'))).scrollHandler.scrollWhileDragging(
                position.top - this.scrollPanel.offset().top);
        }
        var box = this._insideDropBox();
        // todo: embed hover-variables into a class?
        if ($D.timer) {clearTimeout($D.timer);}
        if (box) {
            box.elem.addClass('active');
            // add a virtual-hover over parent-element
            if (box.parentView) {
                if (box.parentView instanceof NodeView) {
                    if (box.parentView !== $D.hoverItem) {
                        $D.hoverItem.removeClass('ui-btn-hover-c');
                    }
                    box.parentView.addClass('ui-btn-hover-c');
                    $D.hoverItem = box.parentView;
                } else {
                    if ($D.hoverItem) {
                        $D.hoverItem.removeClass('ui-btn-hover-c');
                    }
                }
            }
            $D.log(['debug', 'drag'], "Defined drop box of type" + box.type);
        } else { // virtual blur
            if ($D.hoverItem) {
                $D.hoverItem.removeClass('ui-btn-hover-c');
            }
        }
        if (this.activeBox && (this.activeBox != box)) {
            this.activeBox.elem.removeClass('active');
        }
        this.activeBox = box;
        this.hovering = this.hovering ? this.hovering : null;
        this.hoveringBox = this.hoveringBox ? this.hoveringBox : null;
        if ((this.hovering != null) && (this.hoveringBox != null)) {
            if (this.activeBox != this.hoveringBox) {
                this.hovering && window.clearTimeout(this.hovering);
                this.hovering = null;
                this.hoveringBox = null;
            }
        }
        if (this.activeBox && this.activeBox.type === 'drophandle') {
            var hoverItem = this.activeBox.item.item;
            // mjs - if the element has children and they are hidden, show them after a delay (CSS responsible)
            if (this.options.expandOnHover) {
                if (!this.hovering) {
                    // hoverItem.addClass(o.hoveringClass);
                    /*
                     var self = this;
                     if (hoverItem.hasClass('collapsed')) {
                     this.hovering = window.setTimeout(function() {
                     $D.log(['debug','drag'],"Trying to expand on hover");
                     hoverItem.removeClass(o.collapsedClass).addClass(o.expandedClass);
                     View.get(hoverItem[0].id).children.renderUpdate();
                     self.refreshPositions();
                     self._drawDropLines();
                     // self._trigger("expand", event, self._uiHash());
                     }, o.expandOnHover);
                     }
                     */
                    this.hoveringBox = this.activeBox;
                }
            }
        }
        return false;
    }

    dragStop(options:DragStartI) {
        var that = this;
        // mjs - clear the expansion-hovering timeout, just to be sure
        // $('.'+this.options.hoveringClass).removeClass(this.options.hoveringClass);
        this.hovering && window.clearTimeout(this.hovering);
        this.hovering = null;
        // Beginning of of prototype._mouseStop
        // End of prototype._mouseStop
        $(document.body).addClass('transition-mode').removeClass('drop-mode');
        var rootID = View.get(this.currentItem[0].id).nodeRootView.id;
        // check for active drop-target and execute move
        if (this.activeBox != null) {
            this.reverting = false;
            // console.log("Dropping with type "+this.activeBox.type+" relative to item: "+this.activeBox.item.item.attr('id'));
            var refview = View.get(this.activeBox.item.id);
            // todo: must set item.id for all line items, too
            // todo: must set top/left/width/height in each panel-view
            var targetview:NodeView = <NodeView>View.get(this.currentItem.attr('id'));
            if (!(refview instanceof NodeView)) {
                console.log("refview is of the wrong type with id=" + refview.id);
            }
            if (!(targetview instanceof NodeView)) {
                console.log("targetview is of the wrong type with id=" + targetview.id);
            }
            if (this.activeBox.type === 'droptop') {
                ActionManager.schedule(
                    function() {
                        return Action.checkTextChange(targetview.header.name.text.id);
                    },
                    function() {
                        return {
                            action: MoveBeforeAction,
                            activeID: targetview.value.cid,
                            referenceID: refview.value.cid,
                            oldRoot: targetview.nodeRootView.id,
                            newRoot: refview.nodeRootView.id,
                            anim: 'dock',
                            dockElem: that.helper[0],
                            focus: false
                        };
                    });
            } else if (this.activeBox.type === 'dropbottom') {
                ActionManager.schedule(
                    function() {
                        return Action.checkTextChange(targetview.header.name.text.id);
                    },
                    function() {
                        return {
                            action: MoveAfterAction,
                            activeID: targetview.value.cid,
                            referenceID: refview.value.cid,
                            oldRoot: targetview.nodeRootView.id,
                            newRoot: refview.nodeRootView.id,
                            anim: 'dock',
                            dockElem: that.helper[0],
                            focus: false
                        };
                    });
            } else if (this.activeBox.type === 'drophandle') {
                ActionManager.schedule(
                    function() {
                        return Action.checkTextChange(targetview.header.name.text.id);
                    },
                    function() {
                        return {
                            action: MoveIntoAction,
                            referenceID: refview.value.cid,
                            activeID: targetview.value.cid,
                            oldRoot: targetview.nodeRootView.id,
                            newRoot: refview.nodeRootView.id,
                            anim: 'dock',
                            dockElem: that.helper[0],
                            focus: false
                        };
                    });
            } else if (this.activeBox.type === 'dropleft') {
                ActionManager.schedule(
                    function() {
                        return Action.checkTextChange(targetview.header.name.text.id);
                    },
                    function() {
                        return {
                            action: PanelCreateAction,
                            activeID: targetview.value.cid,
                            prevPanel: PanelManager.prevpanel[refview.id],
                            oldRoot: targetview.nodeRootView.id,
                            newRoot: 'new',
                            dockElem: that.helper[0],
                            focus: false
                        };
                    });
            } else if (this.activeBox.type === 'dropright') {
                ActionManager.schedule(
                    function() {
                        return Action.checkTextChange(targetview.header.name.text.id);
                    },
                    function() {
                        return {
                            action: PanelCreateAction,
                            activeID: targetview.value.cid,
                            prevPanel: refview.id,
                            oldRoot: targetview.nodeRootView.id,
                            newRoot: 'new',
                            dockElem: that.helper[0],
                            focus: false
                        };
                    });
            } else {
                console.log('ERROR: Invalid boxtype');
                debugger;
            }
            this.activeBox = null;
            return true;
        } else { // cancel action
            var that = this;
            var cur = this.currentItem.offset();
            this.reverting = true;
            this.helper.animate({
                left: cur.left,
                top: cur.top
            }, 200, function() {
                that.currentItem.removeClass('drag-hidden');
                that.helper[0].parentNode.removeChild(that.helper[0]);
                that.helper[0] = null;
                that.helper = null;
                that.hideDropLines();
                that.reverting = false;
            });
            return false;
        }
    }

    private _createHelper() {
        var o = this.options;
        var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [this.currentItem])) : (o.helper == 'clone' ? this.currentItem.clone() : this.currentItem);
        if (!helper.parents('body').length) //Add the helper to the DOM if that didn't happen already
        {
            $(o.appendTo != 'parent' ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);
        }
        if (helper[0].style.width == '' || o.forceHelperSize) helper.width(this.currentItem.width());
        if (helper[0].style.height == '' || o.forceHelperSize) helper.height(this.currentItem.height());
        helper.addClass('ui-first-child').addClass('ui-last-child');
        return helper;
    }

    private _cacheHelperProportions() {
        this.helperProportions = {
            width: this.helper.outerWidth(),
            height: this.helper.outerHeight()
        };
    }

    private _cacheMargins() {
        this.margins = <PositionI>{
            left: (parseInt(this.currentItem.css("marginLeft"), 10) || 0),
            top: (parseInt(this.currentItem.css("marginTop"), 10) || 0)
        };
    }

    private _getParentOffset() {
        //Get the offsetParent and cache its position
        this.offsetParent = this.helper.offsetParent();
        var po = this.offsetParent.offset();
        if ((this.offsetParent[0] == document.body) //This needs to be actually done for all browsers, since pageX/pageY includes this information
            || (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $D.isIE)) //Ugly IE fix
        {
            po = { top: 0, left: 0 };
        }
        return {
            top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
            left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
        };
    }

    public refresh() {
        this.panels = this.element.find('.ui-scrollview-clip');
        this._refreshItems();
        this.refreshPositions(false);
        return this;
    }

    _refreshItems() {
        this.items = [];
        var items = this.items;
        var _queries = $('li');
        for (var j = 0, queriesLength = _queries.length; j < queriesLength; j++) {
            items.push({
                id: _queries[j].id,
                item: $(_queries[j]),
                parentPanel: $(this._closestPanel(_queries[j])),
                width: 0,
                height: 0,
                left: 0,
                top: 0
            });
        }
    }

    refreshPositions(fast) {

        //This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
        if (this.offsetParent && this.helper) {
            this.offset.parent = this._getParentOffset();
        }
        for (var i = this.items.length - 1; i >= 0; i--) {
            var item = this.items[i];
            var t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;
            if (!fast) {
                item.width = t.outerWidth();
                item.height = t.outerHeight();
            }
            var p = t.offset();
            item.left = p.left;
            item.top = p.top;
        }
        ;
        return this;
    }

    private _getRelativeOffset() {
            return { top: 0, left: 0 };
    }

    _convertPositionTo(d, pos?):PositionI {
        if (!pos) pos = this.position;
        var mod = d == "absolute" ? 1 : -1;
        var o = this.options;
        return <PositionI>{
            top: (
                pos.top																	// The absolute mouse position
                    + this.offset.relative.top * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
                    + this.offset.parent.top * mod											// The offsetParent's offset without borders (offset + border)
                ),
            left: (
                pos.left																// The absolute mouse position
                    + this.offset.relative.left * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
                    + this.offset.parent.left * mod											// The offsetParent's offset without borders (offset + border)
                )
        };
    }

    _closestPanel(element) {
        var cname;
        while (element) {
            if (element.nodeName.toLowerCase() === 'body') {return null;}
            cname = ( typeof element.className === 'string' ) && ( element.className + ' ' );
            if (cname && cname.indexOf("ui-scrollview-clip ") > -1) {
                break;
            }
            element = element.parentNode;
        }
        return element;
    }

    _generatePosition(position):PositionI {
        var pageX = position.left;
        var pageY = position.top;
        /*
         * - Position constraining -
         * Constrain the position to a mix of grid, containment.
         */
        if (this.originalPosition) { //If we are not dragging yet, we won't check for options
            if (this.options.grid) {
                var o = this.options;
                var top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
                pageY = top;
                var left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
                pageX = left;
            }
        }
        return <PositionI>{
            top: (
                pageY																// The absolute mouse position
                    - this.offset.click.top													// Click offset (relative to the element)
                    - this.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
                    - this.offset.parent.top												// The offsetParent's offset without borders (offset + border)
                ),
            left: (
                pageX																// The absolute mouse position
                    - this.offset.click.left												// Click offset (relative to the element)
                    - this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
                    - this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
                )
        };
    }

    softKeyboardOpen() {
        // scroll to active element in active-panel
        /*
         var input = $('li.ui-focus');
         if (input.length>0) {
         var panel = input.closest('.ui-scrollview-clip');
         var globalOffsetY = input.offset().top; // scroll to this offset
         var containerOffsetY = panel.offset().top;
         var oldScrollY = panel.scrollview('getScrollPosition').y;
         var newScrollY = -(globalOffsetY - containerOffsetY) + oldScrollY;
         panel.scrollview('scrollTo', 0, newScrollY);
         }
         alert("softKeyboardOpen");
         */
    }

    softKeyboardClose() {
//            alert("softKeyboardClose");
    }

    _drawDropLine(o) {
        /* Implement this when doing drag/drop changes
         dropTargets: function() {
         // "drop-candidates" not minimized, possibly only on-screen
         // each candidate needs to identify its compatibility, action-type and assumptions
         }
         */
        setTimeout(function() {
            var item = o.item;
            var canvas = o.canvas;
            var type = o.type;
            var ctop = o.offset.top;
            var cleft = o.offset.left;
            var d:DropBox = item.dropboxes[item.dropboxes.length] =
                <DropBox>{type: type, item: item};
            if (type === 'droptop') {
                // boundaries for drawn box (smaller than active hover area)
                item[type] = $('<div></div>').appendTo(canvas)
                    .addClass('dropborder')
                    .css('top', (item.top - ctop) + 'px')
                    .css('left', (item.left - cleft + $D.lineHeight) + 'px')
                    .css('height', '0px')
                    .css('width', (item.width - 1.5 * $D.lineHeight) + 'px');
                // boundaries for active hover-area, (larger than drawn area)
                d.top = item.top - ($D.lineHeight / 2);
                d.bottom = item.top + ($D.lineHeight / 2);
                d.left = item.left + $D.lineHeight; // stay clear of handle
                d.right = item.left + item.width - $D.lineHeight / 2;
                d.parentView = (<HandleImageView>View.get(item.item[0].id)).parentView.parentView;
            } else if (type === 'dropbottom') {
                item[type] = $('<div></div>').appendTo(canvas)
                    .addClass('dropborder')
                    .css('top', (item.top + item.height - ctop - 1) + 'px')
                    .css('left', (item.left - cleft + $D.lineHeight) + 'px')
                    .css('width', (item.width - 1.5 * $D.lineHeight) + 'px')
                    .css('height', '0px');
                d.top = item.top + item.height - 0.5 * $D.lineHeight;
                d.bottom = item.top + item.height + 0.5 * $D.lineHeight;
                d.left = item.left + $D.lineHeight; // stay clear of handle
                d.right = item.left + item.width - $D.lineHeight / 2;
                d.parentView = (<HandleImageView>View.get(item.item[0].id)).parentView.parentView;
            } else if (type === 'drophandle') {
                item[type] = $('<div></div>').appendTo(canvas)
                    .addClass('droparrow')
                    .css('top', (item.top - ctop - 1) + 'px')
                    .css('left', (item.left - cleft - 1) + 'px');
                d.top = item.top;
                d.bottom = item.top + $D.lineHeight;
                d.left = item.left;
                d.right = item.left + $D.lineHeight;
                d.parentView = <NodeView>View.get(item.item[0].id);
            } else if (type === 'dropleft') {
                item[type] = $('<div></div>').appendTo(canvas)
                    .addClass('dropborder')
                    .css('top', (item.top - ctop) + 'px')
                    .css('left', (item.left - cleft - 1 - 5) + 'px')
                    .css('width', '0px')
                    .css('height', (item.height) + 'px');
                d.top = item.top;
                d.bottom = item.top + item.height;
                d.left = item.left - 5 - 5;
                d.right = item.left - 5 + 5;
                d.parentView = null;
            } else if (type === 'dropright') {
                item[type] = $('<div></div>').appendTo(canvas)
                    .addClass('dropborder')
                    .css('top', (item.top - ctop) + 'px')
                    .css('left', (item.left + item.width - cleft - 1 + 5) + 'px')
                    .css('width', '0px')
                    .css('height', (item.height) + 'px');
                d.top = item.top;
                d.bottom = item.top + item.height;
                d.left = item.left + 5 + item.width - 5;
                d.right = item.left + 5 + item.width + 5;
                d.parentView = null;
            }
            if (item[type]) {
                d.elem = item[type];
            }
        }, 2);
    }

    _showDropLines() {
        $(document.body).addClass('drop-mode');
    }

    _hideDropLines() {
        $('body').removeClass('drop-mode').removeClass('transition-mode');
        if (this.activeBox != null) {
            this.activeBox.elem.removeClass('active');
        }
    }

    _emptyDropLayers() {
        $(this.options.dropLayers).html('');
        var drawlayer = $('#' + (<DiathinkView>View.getCurrentPage()).drawlayer.id);
        drawlayer.children('.dropborder').remove();
    }

    _validateDropItem(itemEl:JQuery):{bottom:boolean;top:boolean;handle:boolean} {
        var noBottom = false, noTop = false, noHandle = false;
        // cannot drop current-item on itself
        if (itemEl[0] === this.currentItem[0]) {
            return null;
        }
        // cannot drop the current-item inside itself
        var activeModel = View.get(this.currentItem[0].id).value;
        var itemModel = View.get(itemEl[0].id).value;
        var model = itemModel;
        while ((model != null) && (model !== activeModel)) {
            model = model.get('parent');
        }
        if (model != null) { // it is a child of itself
            return null;
        }
        // cannot drop current-item adjacent to itself
        if (activeModel.get('parent') === itemModel.get('parent')) {
            var aRank = activeModel.rank();
            var iRank = itemModel.rank();
            if (aRank - iRank === 1) {
                noBottom = true;
            } else if (iRank - aRank === 1) {
                noTop = true;
            }
        }
        if (activeModel.get('parent') === itemModel) {
            noHandle = true;
        }
        var prevElement:HTMLElement = <HTMLElement>(<HTMLElement>itemEl[0]).previousSibling;
        if (prevElement && View.getFromElement(prevElement).nodeView.children.elem.children.length !== 0) {
            // predecessor has visible children, cannot drop above it
            noTop = true;
        }
        if (itemEl[0] && View.getFromElement(itemEl[0]).nodeView.children.elem.children.length !== 0) {
            // has visible children, cannot drop below it
            noBottom = true;
        }
        if ((<HTMLElement>itemEl[0]).nextSibling != null) {
            // not last in a list, cannot drop below it
            noBottom = true;
        }
        return {bottom: !noBottom, top: !noTop, handle: !noHandle};
    }

    _drawDropLines() {
        // loop over items
        // determine whether to draw top or bottom line
        // determine position to draw at
        $D.log(['debug', 'drag'], "Redrawing dropLines");
        var that = this;
        setTimeout(function() {
            that._emptyDropLayers();
            that._showDropLines();
            $D.lineHeight = Math.round(1.5 * Number($(document.body).css('font-size').replace(/px/, '')));
            // foreach M.ScrollView, cache offset top/left
            var panelParent = (<DiathinkView>View.getCurrentPage()).content.grid;
            var canvas1 = panelParent.scroll1.outline.droplayer;
            var canvas2 = panelParent.scroll2.outline.droplayer;
            var canvas0 = (<DiathinkView>View.getCurrentPage()).drawlayer;
            canvas1.cacheOffset = $(canvas1.elem).offset();
            canvas2.cacheOffset = $(canvas2.elem).offset();
            canvas0.cacheOffset = $(canvas0.elem).offset();
            // todo: loop over panels, draw vertical lines
            var p:string, n:number, panel:PanelView;
            var PM:typeof PanelManager;
            PM = PanelManager;
            for (var n = 1, p = <string>PM.leftPanel;
                (p !== '') && (n <= PM.panelsPerScreen);
                ++n, p = <string>PM.nextpanel[p]) {
                panel = <PanelView>View.get(p);
                panel.cachePosition();
                panel.dropleft = null;
                panel.dropright = null;
                panel.dropboxes = [];
                if (n === 1) { // permit dropleft
                    // count on panel-creation to caching top/left/height/width dims
                    that._drawDropLine({
                        type: 'dropleft',
                        item: panel,
                        canvas: $('#' + canvas0.id),
                        offset: canvas0.cacheOffset
                    });
                }
                that._drawDropLine({
                    type: 'dropright',
                    item: panel,
                    canvas: $('#' + canvas0.id),
                    offset: canvas0.cacheOffset
                });
            }
            for (var i:number = that.items.length - 1; i >= 0; i--) {
                var item = that.items[i], itemEl = item.item;
                item.droptop = null;
                item.dropbottom = null;
                item.drophandle = null;
                item.dropboxes = [];
                var validate:{bottom:boolean;top:boolean;handle:boolean} = that._validateDropItem(itemEl);
                if (!validate) {continue;}
                var view:OutlineScrollView = <OutlineScrollView>View.get(item.parentPanel[0].id);
                var canvas = $('#' + view.droplayer.id);
                if (validate.top) {
                    that._drawDropLine({
                        type: 'droptop',
                        item: item,
                        canvas: canvas,
                        offset: view.droplayer.cacheOffset
                    });
                }
                if (validate.handle) {
                    that._drawDropLine({
                        type: 'drophandle',
                        item: item,
                        canvas: canvas,
                        offset: view.droplayer.cacheOffset
                    });
                }
                if (validate.bottom) {
                    that._drawDropLine({
                        type: 'dropbottom',
                        item: item,
                        canvas: canvas,
                        offset: view.droplayer.cacheOffset
                    });
                }
            }
            /*
             setTimeout(function() {
             that._previewDropBoxes();
             }, 100);
             */
        }, 5);
    }

    // cache drop-coordinates - currently unused
    _updateDropBoxes(item) {
        var d;
        item.dropboxes = [];
        if (item.dropnull != null) {
        }
        if (item.droptop != null) {
            d = item.dropboxes[item.dropboxes.length] =
            {type: 'droptop', elem: item.droptop, item: item};
            d.top = item.top - ($D.lineHeight / 2) - 1;
            d.bottom = item.top + ($D.lineHeight / 2) + 1;
            d.left = item.left + 16; // stay clear of handle
            d.right = item.left + item.width + 2;
        }
        if (item.dropbottom != null) {
            d = item.dropboxes[item.dropboxes.length] =
            {type: 'dropbottom', elem: item.dropbottom, item: item};
        }
        if (item.drophandle != null) {
            d = item.dropboxes[item.dropboxes.length] =
            {type: 'drophandle', elem: item.drophandle, item: item};
        }
    }

    _previewDropBoxes() {
        var i, j, d;
        var PM:typeof PanelManager;
        PM = PanelManager;
        for (var n = 1, p:string = PM.leftPanel;
            (p !== '') && (n <= PM.panelsPerScreen);
            ++n, p = PM.nextpanel[p]) {
            var panel = View.get(p);
            var canvas = $('#' + View.getCurrentPage().drawlayer.id);
            var ctop = canvas.offset().top;
            var cleft = canvas.offset().left;
            if (!panel.dropboxes) {
                console.log("ERROR: Item " + i + " does not have dropboxes?");
                continue;
            }
            for (j = 0; j < panel.dropboxes.length; ++j) {
                d = panel.dropboxes[j];
                $('<div></div>').appendTo(canvas)
                    .css('position', 'absolute')
                    .css('top', (d.top - ctop) + 'px')
                    .css('left', (d.left - cleft) + 'px')
                    .css('width', (d.right - d.left) + 'px')
                    .css('height', (d.bottom - d.top) + 'px')
                    .css('border', 'dotted red 1px');
            }
        }
        for (i = 0; i < this.items.length; ++i) {
            var view:OutlineScrollView = <OutlineScrollView>View.get(this.items[i].parentPanel[0].id);
            var canvas = $('#' + view.droplayer.id);
            var ctop = canvas.offset().top;
            var cleft = canvas.offset().left;
            if (!this.items[i].dropboxes) {
                console.log("ERROR: Item " + i + " does not have dropboxes?");
                continue;
            }
            for (j = 0; j < this.items[i].dropboxes.length; ++j) {
                d = this.items[i].dropboxes[j];
                $('<div></div>').appendTo(canvas)
                    .css('position', 'absolute')
                    .css('top', (d.top - ctop) + 'px')
                    .css('left', (d.left - cleft) + 'px')
                    .css('width', (d.right - d.left) + 'px')
                    .css('height', (d.bottom - d.top) + 'px')
                    .css('border', 'dotted red 1px');
            }
        }
    }

    drawDropLines() {
        this._drawDropLines();
    }

    hideDropLines() {
        this._hideDropLines();
    }

    // mjs - this function is slightly modified to make it easier to hover over a collapsed element and have it expand
    _insideDropBox():DropBox {
        var i, j, d, n, p;
        $D.log(['debug', 'drag'], "Identifying drop-box");
        // this.position is same, scroll is different for each item
        // cache scroll-positions of each panel
        this.panels.each(function() {
            View.get(this.id).scrollY = View.get(this.id).scrollHandler.getScrollPosition().y;
        });
        for (i = 0; i < this.items.length; ++i) {
            if (this.items[i].dropboxes == null) {continue;} // when mousedrag is called before initialization
            for (j = 0; j < this.items[i].dropboxes.length; ++j) {
                d = this.items[i].dropboxes[j];
                var x = this.positionAbs.left + this.offset.click.left;
                var y = this.positionAbs.top + this.offset.click.top;
                var parentPanel = this.items[i].parentPanel;
                y += View.get(parentPanel.attr('id')).scrollY -
                    this.panelScrollStart[parentPanel.attr('id')];
                if (((x >= d.left) && (x <= d.right)) && ((y >= d.top) && (y <= d.bottom))) {
                    if (this.scrollPanel && (parentPanel.get(0) !==
                        this.scrollPanel.get(0))) {
                        console.log("ERROR: Active panel does not match item");
                    }
                    return d;
                }
            }
        }
        var PM:typeof PanelManager;
        PM = PanelManager;
        // loop over panels to return correct dropbox
        for (n = 1, p = PM.leftPanel;
            (p !== '') && (n <= PM.panelsPerScreen);
            ++n, p = PM.nextpanel[p]) {
            var panel = View.get(p);
            if (panel.dropboxes == null) {continue;} // when mousedrag is called before initialization
            for (j = 0; j < panel.dropboxes.length; ++j) {
                d = panel.dropboxes[j];
                var x = this.positionAbs.left + this.offset.click.left;
                var y = this.positionAbs.top + this.offset.click.top;
                if (((x >= d.left) && (x <= d.right)) && ((y >= d.top) && (y <= d.bottom))) {
                    return d;
                }
            }
        }
        return null;
    }
}