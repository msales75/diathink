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
        },
        softKeyboardClose: function() {
//            alert("softKeyboardClose");
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
            $(document.body).addClass('drop-mode');
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
                diathink.helper.style.left = this.position.left+"px";
            }
            if(!this.options.axis || this.options.axis !== "x") {
                diathink.helper.style.top = this.position.top+"px";
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

			// mjs - clear the expansion-hovering timeout, just to be sure
			  // $('.'+this.options.hoveringClass).removeClass(this.options.hoveringClass);
			this.hovering && window.clearTimeout(this.hovering);
			this.hovering = null;

            // Beginning of of prototype._mouseStop
            if(!event) return;
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
                        dragView: refview.rootID,
                        referenceID: refview.value.cid,
                        targetID: targetview.value.cid
                    });
                } else if (this.activeBox.type==='dropbottom') {
                    diathink.MoveAfterAction.createAndExec({
                        dragView: refview.rootID,
                        referenceID: refview.value.cid,
                        targetID: targetview.value.cid
                    });
                } else if (this.activeBox.type==='drophandle') {
                    diathink.MoveIntoAction.createAndExec({
                        dragView: refview.rootID,
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
                    diathink.helper.parentNode.removeChild(diathink.helper);
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
        }

	}));

	$.mjs.nestedSortable.prototype.options = $.extend({}, $.ui.sortable.prototype.options, $.mjs.nestedSortable.prototype.options);
})(jQuery);
