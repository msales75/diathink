/*
 * jQuery UI Nested Sortable
 * v 2.0 / 29 oct 2012
 * http://mjsarfatti.com/sandbox/nestedSortable
 *
 * Depends on:
 *	 jquery.ui.sortable.js 1.10+
 *
 * Copyright (c) 2010-2013 Manuele J Sarfatti
 * Licensed under the MIT License
 * http://www.opensource.org/licenses/mit-license.php
 */

(function($) {

	function isOverAxis( x, reference, size ) {
		return ( x > reference ) && ( x < ( reference + size ) );
	}

	$.widget("mjs.nestedSortable", $.extend({}, $.ui.sortable.prototype, {

		options: {
			doNotClear: false,
			expandOnHover: 700,
			isAllowed: function(placeholder, placeholderParent, originalItem) { return true; },
			isTree: false,
			listType: 'ol',
			maxLevels: 0,
			buryDepth: 0,
			protectRoot: false,
			rtl: false,
			startCollapsed: false,
			tabSize: 20,
            dropLayers: [],
			branchClass: 'mjs-nestedSortable-branch',
			collapsedClass: 'mjs-nestedSortable-collapsed',
			disableNestingClass: 'mjs-nestedSortable-no-nesting',
			errorClass: 'mjs-nestedSortable-error',
			expandedClass: 'mjs-nestedSortable-expanded',
			hoveringClass: 'mjs-nestedSortable-hovering',
			leafClass: 'mjs-nestedSortable-leaf'
            // connectWith: '.ui-sortable'
		},

		_create: function() {
			this.element.data('ui-sortable', this.element.data('mjs-nestedSortable'));

			// mjs - prevent browser from freezing if the HTML is not correct
            /*
			if (!this.element.is(this.options.listType))
				throw new Error('nestedSortable: Please check that the listType option is set to your actual list type');
				*/

			// mjs - force 'intersect' tolerance method if we have a tree with expanding/collapsing functionality
			if (this.options.isTree && this.options.expandOnHover) {
				this.options.tolerance = 'intersect';
			}

			$.ui.sortable.prototype._create.apply(this, arguments);

			// mjs - prepare the tree by applying the right classes (the CSS is responsible for actual hide/show functionality)
            this.refreshStyle();


            // MS - identify the OutlineView we are in
            // var view = M.ViewManager.findViewById(this.element.attr('id'));
            // if ((view.type != 'M.ListView') || (view.rootID != view.id)) {
                // console.log("ERROR: View rootID is not here, for view-id="+view.id);
            // }
            // this.rootView = view;
            if (this.options.keyboard) {
                // override open/close keyboard methods
                this.options.keyboard.softKeyboardOpen = this.softKeyboardOpen;
                this.options.keyboard.softKeyboardClose = this.softKeyboardClose;
            }
            this.panels = $(this.element).find('.ui-scrollview-clip');
        },

        update: function() {
            // todo: initialize lists for each panel - outside nestedSortable?
            this.panels = $(this.element).find('.ui-scrollview-clip');
            this.refresh();
        },

		_destroy: function() {
			this.element
				.removeData("mjs-nestedSortable")
				.removeData("ui-sortable");
			return $.ui.sortable.prototype._destroy.apply(this, arguments);
		},

        refreshStyle: function() {
            if (this.options.isTree) {
                var self = this;
                $(this.items).each(function() {
                    var $li = this.item;
                    if ($li.childDepth(self.options.buryDepth).children(self.options.listType).children().length) {
                        $li.addClass(self.options.branchClass);
                        // expand/collapse class only if they have children
                        if (self.options.startCollapsed) $li.addClass(self.options.collapsedClass);
                        else $li.addClass(self.options.expandedClass);
                    } else {
                        $li.addClass(self.options.leafClass).addClass(self.options.expandedClass);
                    }
                });
            }
        },
        softKeyboardOpen: function() {
            // scroll to active element in active-panel

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
        },
        softKeyboardClose: function() {
            alert("softKeyboardClose");
        },
        _drawDropLine: function(o) {
            /* Implement this when doing drag/drop changes
             dropTargets: function() {
             // "drop-candidates" not minimized, possibly only on-screen
             // each candidate needs to identify its compatibility, action-type and assumptions
             }
             */
            var item = o.item;
            var canvas = o.canvas;
            var type = o.type;
            var ctop = o.offset.top;
            var cleft = o.offset.left;
            d = item.dropboxes[item.dropboxes.length] =
              {type: type, item: item};

            if (type==='droptop') {
                // boundaries for drawn box (smaller than active hover area)
                item[type] = $('<div></div>').appendTo(canvas)
                    .addClass('dropborder')
                    .css('top', (item.top-ctop)+'px')
                    .css('left', (item.left-cleft+item.height)+'px')
                    .css('height', '0px')
                    .css('width', (item.width-item.height-item.height/2)+'px');
                // boundaries for active hover-area, (larger than drawn area)
                d.top = item.top - (item.height/2);
                d.bottom = item.top + (item.height/2);
                d.left = item.left + item.height; // stay clear of handle
                d.right = item.left+item.width-item.height/2;
                d.parentView = M.ViewManager.getViewById(item.item[0].id).parentView.parentView;
            } else if (type==='dropbottom') {
                item[type] = $('<div></div>').appendTo(canvas)
                    .addClass('dropborder')
                    .css('top', (item.top+item.height-ctop-1)+'px')
                    .css('left', (item.left-cleft+item.height)+'px')
                    .css('width',(item.width-item.height-item.height/2)+'px')
                    .css('height', '0px');
                d.top = item.top + (item.height/2);
                d.bottom = item.top + (3*item.height/2);
                d.left = item.left + item.height; // stay clear of handle
                d.right = item.left+item.width-item.height/2;
                d.parentView = M.ViewManager.getViewById(item.item[0].id).parentView.parentView;
            } else if (type==='drophandle') {
                item[type] = $('<div></div>').appendTo(canvas)
                    .addClass('droparrow')
                    .css('top', (item.top-ctop-1)+'px')
                    .css('left', (item.left-cleft-1)+'px');
                d.top = item.top;
                d.bottom = item.top + item.height;
                d.left = item.left;
                d.right = item.left + item.height;
                d.parentView = M.ViewManager.getViewById(item.item[0].id);
            }
            if (item[type]) {
                d.elem = item[type];
            }
        },
        _showDropLines: function() {
            $('body').addClass('drop-mode');
        },

        _hideDropLines: function() {
            $('body').removeClass('drop-mode');
            if (this.activeBox!=null) {
                this.activeBox.elem.removeClass('active');
            }
        },
        _emptyDropLayers: function() {
            $(this.options.dropLayers).html('');
        },
        _validateDropItem: function(itemEl) {

            var noBottom = false, noTop = false, noHandle = false;
            // cannot drop current-item on itself
            if (itemEl[0] === this.currentItem[0]) {
                return false;
            }

            // cannot drop the current-item inside itself
            var activeModel = M.ViewManager.getViewById(this.currentItem.attr('id')).value;
            var itemModel = M.ViewManager.getViewById(itemEl.attr('id')).value;

            var model = itemModel;
            while ((model != null)&&(model !== activeModel)) {
                model = model.get('parent');
            }
            if (model != null) { // it is a child of itself
                return false;
            }

            // cannot drop current-item adjacent to itself
            if (activeModel.get('parent') === itemModel.get('parent')) {
                var aRank = activeModel.rank();
                var iRank = itemModel.rank();
                if (aRank-iRank === 1) {
                    noBottom = true;
                } else if (iRank-aRank === 1) {
                    noTop = true;
                }
            }
            if (activeModel.get('parent') === itemModel) {
                noHandle = true;
            }
            if (itemEl.prev().childDepth(this.options.buryDepth).children('ul').children('li:visible').length!==0) {
                // predecessor has visible children, cannot drop above it
                noTop = true;
            }
            if (itemEl.childDepth(this.options.buryDepth).children('ul').children('li:visible').length !== 0) {
                // last in a list, cannot drop below it
                noBottom = true;
            }
            if (itemEl.next().length!==0) {
                // has visible children, cannot drop below it
                noBottom = true;
            }
            return {bottom: !noBottom, top: !noTop, handle: !noHandle};
        },

        _drawDropLines: function() {
            // loop over items
            // determine whether to draw top or bottom line
            // determine position to draw at
            diathink.log(['debug','drag'],"Redrawing dropLines");

            this._emptyDropLayers();
            this._showDropLines();

            // foreach M.ScrollView, cache offset top/left
            var panelParent = M.ViewManager.getCurrentPage().content;
            var canvas1 = panelParent.scroll1.outline.droplayer;
            var canvas2 = panelParent.scroll2.outline.droplayer;
            canvas1.cacheOffset = $('#'+canvas1.id).offset();
            canvas2.cacheOffset = $('#'+canvas2.id).offset();

            for (var i = this.items.length - 1; i >= 0; i--) {
                var item = this.items[i], itemEl = item.item;

                item.droptop = null;
                item.dropbottom = null;
                item.drophandle = null;
                item.dropboxes = [];

                var validate = this._validateDropItem(itemEl);
                if (!validate) {continue;}

                var view = M.ViewManager.getViewById(item.parentPanel[0].id);
                var canvas = $('#'+view.droplayer.id);

                if (validate.top) {
                    this._drawDropLine({
                        type: 'droptop',
                        item: item,
                        canvas: canvas,
                        offset: view.droplayer.cacheOffset
                    });
                }
                if (validate.handle) {
                    this._drawDropLine({
                        type: 'drophandle',
                        item: item,
                        canvas: canvas,
                        offset: view.droplayer.cacheOffset
                    });
                }
                if (validate.bottom) {
                    this._drawDropLine({
                        type: 'dropbottom',
                        item: item,
                        canvas: canvas,
                        offset: view.droplayer.cacheOffset
                    });
                }
            }
            // this._previewDropBoxes();
        },

        // cache drop-coordinates
        _updateDropBoxes: function(item) {
            var d;
            item.dropboxes = [];
            if (item.dropnull != null) {
                /*
                d = item.dropboxes[item.dropboxes.length] =
                {type: 'dropnull', elem: item.dropnull, item: item};
                d.top = item.top+2;
                d.bottom = item.top+item.height+2;
                d.left = item.left+3;
                d.right = item.left+item.width-3+2;
                */
            }
            if (item.droptop != null) {
                d = item.dropboxes[item.dropboxes.length] =
                {type: 'droptop', elem: item.droptop, item: item};
                d.top = item.top - (item.height/2) - 1;
                d.bottom = item.top + (item.height/2) + 1;
                d.left = item.left + 16; // stay clear of handle
                d.right = item.left+item.width+2;
            }
            if (item.dropbottom != null) {
                d = item.dropboxes[item.dropboxes.length] =
                {type: 'dropbottom', elem: item.dropbottom, item: item};
            }
            if (item.drophandle != null) {
                d = item.dropboxes[item.dropboxes.length] =
                {type: 'drophandle', elem: item.drophandle, item: item};
            }
        },
        _previewDropBoxes: function() {
            var i, j, d;
            for (i=0; i<this.items.length; ++i) {
                var view = M.ViewManager.getViewById(this.items[i].item.attr('id'));
                while (view.type !== 'M.ScrollView') {
                    view = view.parentView;
                    if (view==null) {debug.log(['error','drag'],'Invalid View'); return;}
                }
                var canvas = $('#'+view.droplayer.id);
                var ctop = canvas.offset().top;
                var cleft = canvas.offset().left;
                for (j=0; j<this.items[i].dropboxes.length; ++j) {
                    d = this.items[i].dropboxes[j];
                    $('<div></div>').appendTo(canvas)
                        .css('position','absolute')
                        .css('top', (d.top-ctop)+'px')
                        .css('left', (d.left-cleft)+'px')
                        .css('width', (d.right-d.left)+'px')
                        .css('height',(d.bottom-d.top)+'px')
                        .css('border','dotted red 1px');
                }
            }
        },
		_mouseDrag: function(event) {
			var i, item, itemElement, intersection,
				o = this.options,
				scrolled = false, self = this;

			//Compute the helpers position
            // relative to 'offsetParent' which is the nearest relative/absolute positioned element
            // todo: these come from sortable.js
			this.position = this._generatePosition(event);
			this.positionAbs = this._convertPositionTo("absolute");


            // define this.overflowOffset (done in _mouseStart)
            // todo: do we need to update boxes more often when scrolling?
            // todo: which panel are we over?

            // todo: loop over panels first, then items by-panel second?
            // for now, just loop over panels independently

            //Set the helper position
            if(!this.options.axis || this.options.axis !== "y") {
                diathink.helper[0].style.left = this.position.left+"px";
            }
            if(!this.options.axis || this.options.axis !== "x") {
                diathink.helper[0].style.top = this.position.top+"px";
            }

            if (this.scrollPanel) {
                var left = this.scrollPanel.offset().left;
                var right = left + this.scrollPanel.width();
                if (!(this.positionAbs.left >= left && this.positionAbs.left <= right)) {
                    this.scrollPanel = null;
                    // console.log("Clearing scrollPanel");
                }
            }
            if (!this.scrollPanel) {
                this.panels.each(function() {
                    var left = $(this).offset().left;
                    var right = left + $(this).width();
                    if (self.positionAbs.left >= left && self.positionAbs.left <= right) {
                        self.scrollPanel = $(this);
                        // console.log("Changing scrollPanel to ");
                        // console.log(self.scrollPanel);
                    }
                });
            }
            // todo: initialize lists for each panel - outside nestedSortable?

            if (this.scrollPanel) {
                // do we need to initialize the panel?
                var panelid = this.scrollPanel.attr('id');
                if (this.panelScrollStart[panelid] === undefined) {
                    this.panelScrollStart[panelid] = this.scrollPanel.scrollview('getScrollPosition').y;
                }
                // todo: add constraint?: for later panels, could scroll-position be different than the
                // scroll-position at mouse-start, which is where items are last updated?

                this.scrollPanel.scrollview( 'scrollWhileDragging',
                        event.pageY - this.scrollPanel.offset().top);

                var box = this._insideDropBox();
                // todo: embed hover-variables into a class?
                if (diathink.timer) {clearTimeout(diathink.timer);}
                if (box) {
                    box.elem.addClass('active');
                    // add a virtual-hover over parent-element
                    if (box.parentView.type==='M.ListItemView') {
                        var parentEl = $('#'+box.parentView.id).get(0);
                        if (parentEl !== diathink.hoverItem) {
                            $(diathink.hoverItem).removeClass('ui-btn-hover-c');
                        }
                        $(parentEl).addClass('ui-btn-hover-c');
                        diathink.hoverItem = parentEl;
                    } else {
                        if (diathink.hoverItem) {
                            $(diathink.hoverItem).removeClass('ui-btn-hover-c');
                        }
                    }
                    diathink.log(['debug','drag'],"Defined drop box of type"+box.type);
                } else { // virtual blur
                    if (diathink.hoverItem) {
                        $(diathink.hoverItem).removeClass('ui-btn-hover-c');
                    }
                }
                if (this.activeBox && (this.activeBox!=box)) {
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
                    if (o.expandOnHover) {
                        if (!this.hovering) {
                            // hoverItem.addClass(o.hoveringClass);
                            var self = this;
                            this.hovering = window.setTimeout(function() {
                                diathink.log(['debug','drag'],"Trying to expand on hover")
                                hoverItem.removeClass(o.collapsedClass).addClass(o.expandedClass);
                                self.refreshPositions();
                                self._drawDropLines();
                                // self._trigger("expand", event, self._uiHash());
                            }, o.expandOnHover);
                            this.hoveringBox = this.activeBox;
                        }
                    }
                }
            }
            return false;
        },

		_mouseStop: function(event, noPropagation) {

			// mjs - if the item is in a position not allowed, send it back
            /*
			if (this.beyondMaxLevels) {
				this._trigger("revert", event, this._uiHash());
			}
			*/

			// mjs - clear the expansion-hovering timeout, just to be sure
			  // $('.'+this.options.hoveringClass).removeClass(this.options.hoveringClass);
			this.hovering && window.clearTimeout(this.hovering);
			this.hovering = null;

            // hide boxes
            // var outlines = diathink.OutlineManager.outlines;
            // for (var o in outlines) {
            //    $('#'+outlines[o].rootID).nestedSortable('hideDropLines');
            // }
            // this.hideDropLines();

            // Beginning of of prototype._mouseStop
            // $.ui.sortable.prototype._mouseStop.apply(this, arguments);

            if(!event) return;

            //If we are using droppables, inform the manager about the drop
            /*
            if ($.ui.ddmanager && !this.options.dropBehaviour)
                $.ui.ddmanager.drop(this, event);
            */

            if (this.options.revert) { // MS Note that this won't work without placeholder
                /* todo: remove drag-hidden if aborted
                setTimeout(function() {
                    $('#'+target.id).removeClass('drag-hidden');
                }, 80); */
            } else {
                // todo: don't destroy helper here any more?
                // this._clear(event, noPropagation);
            }
            // when we want to remove helper we do this:



            // End of prototype._mouseStop

            // TODO: some of this should probably be done before calling _clear?
            // todo: make a temporary border/focus/animation for object docking,
            // todo: (including vertical-gap-adjustments).  Also make animation for reversion.

            var rootID = M.ViewManager.findViewById(this.currentItem[0].id).rootID;
            // check for active drop-target and execute move
            if (this.activeBox != null) {
                this.reverting = false;
                // console.log("Dropping with type "+this.activeBox.type+" relative to item: "+this.activeBox.item.item.attr('id'));
                var refview = M.ViewManager.findViewById(this.activeBox.item.item.attr('id'));
                var targetview = M.ViewManager.findViewById(this.currentItem.attr('id'));
                if (refview.type != 'M.ListItemView') {
                    console.log("refview is of the wrong type with id="+refview.id);
                }
                if (targetview.type != 'M.ListItemView') {
                    console.log("targetview is of the wrong type with id="+targetview.id);
                }

                if (this.activeBox.type==='droptop') {
                    diathink.MoveBeforeAction.createAndExec({
                        dragView: rootID,
                        referenceID: refview.value.cid,
                        targetID: targetview.value.cid
                    });
                } else if (this.activeBox.type==='dropbottom') {
                    diathink.MoveAfterAction.createAndExec({
                        dragView: rootID,
                        referenceID: refview.value.cid,
                        targetID: targetview.value.cid
                    });
                } else if (this.activeBox.type==='drophandle') {
                    diathink.MoveIntoAction.createAndExec({
                        dragView: rootID,
                        referenceID: refview.value.cid,
                        targetID: targetview.value.cid
                    });
                }
            } else { // cancel action
                var that = this;
                var cur = this.currentItem.offset();
                this.reverting = true;
                $(diathink.helper).animate({
                    left: cur.left,
                    top: cur.top
                }, 200, function() {
                    that.currentItem.removeClass('drag-hidden');
                    $(diathink.helper).remove();
                    diathink.helper = null;
                    that.hideDropLines();
                    that.reverting = false;
                });
            }
            this.activeBox = null;

            this.helper = null; // no more internal references to helper, though
            //  diathink.helper may persist.

            return false;
		},

        _mouseStart: function(event, overrideHandle, noActivation) {
            this.panelScrollStart = {};

            $.ui.sortable.prototype._mouseStart.apply(this, arguments);
            // MS Warning todo: - this creates a placeholder

            this.drawDropLines();


            // loop over outlines, each with a different dropLayer
            // var outlines = diathink.OutlineManager.outlines;
            // for (var o in outlines) {
            //    $('#'+outlines[o].rootID).nestedSortable('drawDropLines');
            // }
           // this._previewDropBoxes();
        },

        drawDropLines: function(o) {
            this._drawDropLines();
        },
        hideDropLines: function(o) {
            this._hideDropLines();
        },

		// mjs - this function is slightly modified to make it easier to hover over a collapsed element and have it expand
        _insideDropBox: function(e) {
            var i, j, d;
            diathink.log(['debug','drag'],"Identifying drop-box");
            // this.position is same, scroll is different for each item

            // cache scroll-positions of each panel
            this.panels.each(function() {
                M.ViewManager.getViewById(this.id).scrollY = $(this).scrollview('getScrollPosition').y;
            });

            for (i=0; i<this.items.length; ++i) {
                if (this.items[i].dropboxes == null) {continue;} // when mousedrag is called before initialization
                for (j=0; j<this.items[i].dropboxes.length; ++j) {
                    d = this.items[i].dropboxes[j];
                    var x = this.positionAbs.left + this.offset.click.left;
                    var y = this.positionAbs.top + this.offset.click.top;
                    var parentPanel = this.items[i].parentPanel;
                    y += M.ViewManager.getViewById(parentPanel.attr('id')).scrollY  -
                        this.panelScrollStart[parentPanel.attr('id')];
                    if (((x>= d.left)&&(x<= d.right)) && ((y>= d.top)&&(y<= d.bottom))) {
                        if (parentPanel.get(0) !==
                            this.scrollPanel.get(0)) {
                            console.log("ERROR: Active panel does not match item");
                        }
                        return d;
                    }
                }
            }
            return null;
        },

        // todo: stop using containers
		_contactContainers: function(event) {
            /*
			if (this.options.protectRoot && this.currentItem[0].parentNode == this.element[0] ) {
				return;
			}
			$.ui.sortable.prototype._contactContainers.apply(this, arguments);
            // (contactContainers needs to be adjusted)
            */
		},

        // MS - incorporating _clear code from sortable.js to customize
        _clear: function(event, noPropagation) {

            // this.reverting = false;
            // We delay all events that have to be triggered to after the point where the placeholder has been removed and
            // everything else normalized again
            // var delayedTriggers = [];

            // We first have to update the dom position of the actual currentItem
            // Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)

            // MS - do not use placeholder to place currentItem, but we still have
            //  to remove it after it was created in _mouseStart

            // if(!this._noFinalSort && this.currentItem.parent().length) this.placeholder.before(this.currentItem);
            // this._noFinalSort = null;

            // this.currentItem.removeClass('drag-hidden');
            /*
            if (this.placeholder[0].parentNode.tagName.toLowerCase()!== 'ul') {
                console.log("ERROR: place-holder was not added at a valid location, before currentItem addition");
            }
            if (this.currentItem[0].parentNode.tagName.toLowerCase()!== 'ul') {
                console.log("ERROR: current-item was not added at a valid location");
            }*/

            /*
            if(this.fromOutside && !noPropagation) delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
            if((this.fromOutside || this.domPosition.prev !=
                this.currentItem.prev().not(".ui-sortable-helper")[0] ||
                this.domPosition.parent != this.currentItem.parent()[0]) &&
                !noPropagation) delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed

            // Check if the items Container has Changed and trigger appropriate
            // events.
            if (this !== this.currentContainer) {
                if(!noPropagation) {
                    delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
                    delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.currentContainer));
                    delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.currentContainer));
                }
            }


            //Post events to containers
            for (var i = this.containers.length - 1; i >= 0; i--){
                if(!noPropagation) delayedTriggers.push((function(c) { return function(event) { c._trigger("deactivate", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
                if(this.containers[i].containerCache.over) {
                    delayedTriggers.push((function(c) { return function(event) { c._trigger("out", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
                    this.containers[i].containerCache.over = 0;
                }
            }

            //Do what was originally in plugins
            if(this._storedCursor) $('body').css("cursor", this._storedCursor); //Reset cursor
            if(this._storedOpacity) this.helper.css("opacity", this._storedOpacity); //Reset opacity
            // MS override zIndex to go away completely after done
            // if(this._storedZIndex) this.helper.css("zIndex", this._storedZIndex == 'auto' ? '' : this._storedZIndex); //Reset z-index
             */
            // this.helper.css("zIndex", ''); //Reset z-index

            this.dragging = false;
            // if(this.cancelHelperRemoval) {
                /*
                if(!noPropagation) {
                    this._trigger("beforeStop", event, this._uiHash());
                    for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
                    this._trigger("stop", event, this._uiHash());
                }
                this.fromOutside = false;
                 */
                // return false;
            // }

            // if(!noPropagation) this._trigger("beforeStop", event, this._uiHash());

            /*
            if (this.placeholder[0].parentNode.tagName.toLowerCase() !== 'ul') {
                console.log("ERROR: place-holder was not in correct spot before being removed");
            }*/

            //$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
            // MS remove it here, since it was probably created in _mouseStart
            // if (this.placeholder && (this.placeholder.length>0)) {
                // this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
            // }

            // if(this.helper[0] != this.currentItem[0]) this.helper.remove(); this.helper = null;

            /*
            if(!noPropagation) {
                for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
                this._trigger("stop", event, this._uiHash());
            }

            this.fromOutside = false;

            // mjs - clean last empty ul/ol
            for (var i = this.items.length - 1; i >= 0; i--) {
                var item = this.items[i].item[0];
                this._clearEmpty(item);
            }
            */

            return true;

        },

		_clearEmpty: function(item) {
			var o = this.options;

			var emptyList = $(item).childDepth(o.buryDepth).children(o.listType);

			if (emptyList.length && !emptyList.children().length && !o.doNotClear) {
				o.isTree && $(item).removeClass(o.branchClass + ' ' + o.expandedClass).addClass(o.leafClass);
				emptyList.remove();
			} else if (o.isTree && emptyList.length && emptyList.children().length && emptyList.is(':visible')) {
				$(item).removeClass(o.leafClass).addClass(o.branchClass + ' ' + o.expandedClass);
			} else if (o.isTree && emptyList.length && emptyList.children().length && !emptyList.is(':visible')) {
				$(item).removeClass(o.leafClass).addClass(o.branchClass + ' ' + o.collapsedClass);
			} else if (o.isTree && emptyList.length && ! emptyList.children().length ) {
                $(item).removeClass(o.branchClass).addClass(o.leafClass).removeClass(o.collapsedClass).addClass(o.expandedClass);
            }

		},

        _trigger: function() {
            // console.log("Calling _trigger of type "+arguments[0]);
            // console.log(this);
            // console.log(arguments);
            if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
                this.cancel();
                // might need cancel()?
            }
        },

        _uiHash: function(_inst) {
            var inst = _inst || this;
            return {
                helper: inst.helper,
                // placeholder: inst.placeholder || $([]),
                position: inst.position,
                originalPosition: inst.originalPosition,
                offset: inst.positionAbs,
                item: inst.currentItem,
                sender: _inst ? _inst.element : null,
                originalDOM: inst.domPosition
            };
        }

	}));

	$.mjs.nestedSortable.prototype.options = $.extend({}, $.ui.sortable.prototype.options, $.mjs.nestedSortable.prototype.options);
})(jQuery);
