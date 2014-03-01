m_require("app/dragging/jquery.ui.touch-punch.js");
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

	$.widget2("mjs.nestedSortable", $.extend({}, $.ui.sortable.prototype, {

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

			// mjs - prevent browser from freezing if the HTML is not correct
            /*
			if (!this.element.is(this.options.listType))
				throw new Error('nestedSortable: Please check that the listType option is set to your actual list type');
				*/

			$.ui.sortable.prototype._create.apply(this, arguments);

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
			return $.ui.sortable.prototype._destroy.apply(this, arguments);
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
            setTimeout(function() {
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
                        .css('left', (item.left-cleft+$D.lineHeight)+'px')
                        .css('height', '0px')
                        .css('width', (item.width-1.5*$D.lineHeight)+'px');
                    // boundaries for active hover-area, (larger than drawn area)
                    d.top = item.top - ($D.lineHeight/2);
                    d.bottom = item.top + ($D.lineHeight/2);
                    d.left = item.left + $D.lineHeight; // stay clear of handle
                    d.right = item.left+item.width-$D.lineHeight/2;
                    d.parentView = View.get(item.item[0].id).parentView.parentView;
                } else if (type==='dropbottom') {
                    item[type] = $('<div></div>').appendTo(canvas)
                        .addClass('dropborder')
                        .css('top', (item.top+item.height-ctop-1)+'px')
                        .css('left', (item.left-cleft+$D.lineHeight)+'px')
                        .css('width',(item.width-1.5*$D.lineHeight)+'px')
                        .css('height', '0px');
                    d.top = item.top + item.height - 0.5*$D.lineHeight;
                    d.bottom = item.top + item.height + 0.5*$D.lineHeight;
                    d.left = item.left + $D.lineHeight; // stay clear of handle
                    d.right = item.left+item.width-$D.lineHeight/2;
                    d.parentView = View.get(item.item[0].id).parentView.parentView;
                } else if (type==='drophandle') {
                    item[type] = $('<div></div>').appendTo(canvas)
                        .addClass('droparrow')
                        .css('top', (item.top-ctop-1)+'px')
                        .css('left', (item.left-cleft-1)+'px');
                    d.top = item.top;
                    d.bottom = item.top + $D.lineHeight;
                    d.left = item.left;
                    d.right = item.left + $D.lineHeight;
                    d.parentView = View.get(item.item[0].id);
                } else if (type==='dropleft') {
                    item[type] = $('<div></div>').appendTo(canvas)
                        .addClass('dropborder')
                        .css('top', (item.top-ctop)+'px')
                        .css('left', (item.left-cleft-1-5)+'px')
                        .css('width', '0px')
                        .css('height', (item.height)+'px');
                    d.top = item.top;
                    d.bottom = item.top + item.height;
                    d.left = item.left - 5 - 5;
                    d.right = item.left - 5 + 5;
                    d.parentView = null;
                } else if (type==='dropright') {
                    item[type] = $('<div></div>').appendTo(canvas)
                        .addClass('dropborder')
                        .css('top', (item.top-ctop)+'px')
                        .css('left', (item.left+item.width-cleft-1+5)+'px')
                        .css('width', '0px')
                        .css('height', (item.height)+'px');
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
        },
        _showDropLines: function() {
            $(document.body).addClass('drop-mode');
        },

        _hideDropLines: function() {
            $('body').removeClass('drop-mode').removeClass('transition-mode');
            if (this.activeBox!=null) {
                this.activeBox.elem.removeClass('active');
            }
        },
        _emptyDropLayers: function() {
            $(this.options.dropLayers).html('');
            var drawlayer = $('#'+View.getCurrentPage().drawlayer.id);
            drawlayer.children('.dropborder').remove();
        },
        _validateDropItem: function(itemEl) {

            var noBottom = false, noTop = false, noHandle = false;
            // cannot drop current-item on itself
            if (itemEl[0] === this.currentItem[0]) {
                return false;
            }

            // cannot drop the current-item inside itself
            var activeModel = View.get(this.currentItem.attr('id')).value;
            var itemModel = View.get(itemEl.attr('id')).value;

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
            $D.log(['debug','drag'],"Redrawing dropLines");
            var that = this;

            setTimeout(function() {
                that._emptyDropLayers();
                that._showDropLines();
                $D.lineHeight = Math.round(1.5*Number($(document.body).css('font-size').replace(/px/,'')));
                // foreach M.ScrollView, cache offset top/left
                var panelParent = View.getCurrentPage().content.grid;
                var canvas1 = panelParent.scroll1.outline.droplayer;
                var canvas2 = panelParent.scroll2.outline.droplayer;
                var canvas0 = View.getCurrentPage().drawlayer;
                canvas1.cacheOffset = $('#'+canvas1.id).offset();
                canvas2.cacheOffset = $('#'+canvas2.id).offset();
                canvas0.cacheOffset = $('#'+canvas0.id).offset();

                // todo: loop over panels, draw vertical lines
                var p, n, panel, canvas;
                var PM = $D.PanelManager;
                for (var n= 1, p=PM.leftPanel;
                     (p!=='') && (n<=PM.panelsPerScreen);
                     ++n, p = PM.nextpanel[p]) {
                    panel = View.get(p);
                    panel.cachePosition();
                    panel.dropleft = null;
                    panel.dropright = null;
                    panel.dropboxes = [];
                    if (n===1) { // permit dropleft
                        // count on panel-creation to caching top/left/height/width dims
                        that._drawDropLine({
                            type: 'dropleft',
                            item: panel,
                            canvas: $('#'+canvas0.id),
                            offset: canvas0.cacheOffset
                        });
                    }
                    that._drawDropLine({
                        type: 'dropright',
                        item: panel,
                        canvas: $('#'+canvas0.id),
                        offset: canvas0.cacheOffset
                    });
                }

                for (var i = that.items.length - 1; i >= 0; i--) {
                    var item = that.items[i], itemEl = item.item;

                    item.droptop = null;
                    item.dropbottom = null;
                    item.drophandle = null;
                    item.dropboxes = [];

                    var validate = that._validateDropItem(itemEl);
                    if (!validate) {continue;}

                    var view = View.get(item.parentPanel[0].id);
                    var canvas = $('#'+view.droplayer.id);

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

        },

        // cache drop-coordinates - currently unused
        _updateDropBoxes: function(item) {
            var d;
            item.dropboxes = [];
            if (item.dropnull != null) {
            }
            if (item.droptop != null) {
                d = item.dropboxes[item.dropboxes.length] =
                {type: 'droptop', elem: item.droptop, item: item};
                d.top = item.top - ($D.lineHeight/2) - 1;
                d.bottom = item.top + ($D.lineHeight/2) + 1;
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
            var PM = $D.PanelManager;
            for (var n= 1, p=PM.leftPanel;
                 (p!=='') && (n<=PM.panelsPerScreen);
                 ++n, p = PM.nextpanel[p]) {
                var panel = View.get(p);
                var canvas = $('#'+View.getCurrentPage().drawlayer.id);
                var ctop = canvas.offset().top;
                var cleft = canvas.offset().left;
                if (!panel.dropboxes) {
                    console.log("ERROR: Item "+i+" does not have dropboxes?");
                    continue;
                }
                for (j=0; j<panel.dropboxes.length; ++j) {
                    d = panel.dropboxes[j];
                    $('<div></div>').appendTo(canvas)
                        .css('position','absolute')
                        .css('top', (d.top-ctop)+'px')
                        .css('left', (d.left-cleft)+'px')
                        .css('width', (d.right-d.left)+'px')
                        .css('height',(d.bottom-d.top)+'px')
                        .css('border','dotted red 1px');
                }
            }
            for (i=0; i<this.items.length; ++i) {
                var view = View.get(this.items[i].item.attr('id'));
                while (view.type !== 'ScrollView') {
                    view = view.parentView;
                    if (view==null) {debug.log(['error','drag'],'Invalid View'); return;}
                }
                var view = View.get(this.items[i].parentPanel[0].id);
                var canvas = $('#'+view.droplayer.id);
                var ctop = canvas.offset().top;
                var cleft = canvas.offset().left;
                if (!this.items[i].dropboxes) {
                    console.log("ERROR: Item "+i+" does not have dropboxes?");
                    continue;
                }
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

            // todo: loop over panels first, then items by-panel second?
            // for now, just loop over panels independently

            //Set the helper position
            if(!this.options.axis || this.options.axis !== "y") {
                this.helper[0].style.left = this.position.left+"px";
            }
            if(!this.options.axis || this.options.axis !== "x") {
                this.helper[0].style.top = this.position.top+"px";
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
                        console.log("Changing scrollPanel to "+this.id);
                        // console.log(self.scrollPanel);
                    }
                });
            }
            // todo: initialize lists for each panel - outside nestedSortable?

            if (this.scrollPanel) {
                // do we need to initialize the panel?
                var panelid = this.scrollPanel.attr('id');
                if (this.panelScrollStart[panelid] === undefined) {
                    this.panelScrollStart[panelid] = View.get(this.scrollPanel.attr('id')).scrollview.getScrollPosition().y;
                }
                // todo: add constraint?: for later panels, could scroll-position be different than the
                // scroll-position at mouse-start, which is where items are last updated?

                View.get(this.scrollPanel.attr('id')).scrollview.scrollWhileDragging(
                        event.pageY - this.scrollPanel.offset().top);
            }

                var box = this._insideDropBox();
                // todo: embed hover-variables into a class?
                if ($D.timer) {clearTimeout($D.timer);}
                if (box) {
                    box.elem.addClass('active');
                    // add a virtual-hover over parent-element
                    if (box.parentView) {
                        if (box.parentView.type==='ListItemView') {
                            var parentEl = $('#'+box.parentView.id).get(0);
                            if (parentEl !== $D.hoverItem) {
                                $($D.hoverItem).removeClass('ui-btn-hover-c');
                            }
                            $(parentEl).addClass('ui-btn-hover-c');
                            $D.hoverItem = parentEl;
                        } else {
                            if ($D.hoverItem) {
                                $($D.hoverItem).removeClass('ui-btn-hover-c');
                            }
                        }
                    }
                    $D.log(['debug','drag'],"Defined drop box of type"+box.type);
                } else { // virtual blur
                    if ($D.hoverItem) {
                        $($D.hoverItem).removeClass('ui-btn-hover-c');
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
        },

		_mouseStop: function(event, noPropagation) {

            var that = this;
			// mjs - clear the expansion-hovering timeout, just to be sure
			  // $('.'+this.options.hoveringClass).removeClass(this.options.hoveringClass);
			this.hovering && window.clearTimeout(this.hovering);
			this.hovering = null;

            // Beginning of of prototype._mouseStop
            if(!event) return;
            // End of prototype._mouseStop

            $(document.body).addClass('transition-mode').removeClass('drop-mode');
            var rootID = View.get(this.currentItem[0].id).rootID;
            // check for active drop-target and execute move
            if (this.activeBox != null) {
                this.reverting = false;
                // console.log("Dropping with type "+this.activeBox.type+" relative to item: "+this.activeBox.item.item.attr('id'));
                var refview = View.get(this.activeBox.item.id);
                // todo: must set item.id for all line items, too
                // todo: must set top/left/width/height in each panel-view
                var targetview = View.get(this.currentItem.attr('id'));
                if (refview.type != 'ListItemView') {
                    console.log("refview is of the wrong type with id="+refview.id);
                }
                if (targetview.type != 'ListItemView') {
                    console.log("targetview is of the wrong type with id="+targetview.id);
                }

                if (this.activeBox.type==='droptop') {
                    $D.ActionManager.schedule(
                      function() {
                          return $D.Action.checkTextChange(targetview.header.name.text.id);
                      },
                      function () {return {
                        action: $D.MoveBeforeAction,
                        activeID: targetview.value.cid,
                        referenceID: refview.value.cid,
                        oldRoot: targetview.rootID,
                        newRoot: refview.rootID,
                        anim: 'dock',
                        dockElem: that.helper[0],
                        focus: false
                    };});
                } else if (this.activeBox.type==='dropbottom') {
                    $D.ActionManager.schedule(
                      function() {
                          return $D.Action.checkTextChange(targetview.header.name.text.id);
                      },
                      function() {return {
                        action: $D.MoveAfterAction,
                        activeID: targetview.value.cid,
                        referenceID: refview.value.cid,
                        oldRoot: targetview.rootID,
                        newRoot: refview.rootID,
                        anim: 'dock',
                        dockElem: that.helper[0],
                        focus: false
                    };});
                } else if (this.activeBox.type==='drophandle') {
                    $D.ActionManager.schedule(
                        function() {
                            return $D.Action.checkTextChange(targetview.header.name.text.id);
                        },
                        function() {return {
                        action: $D.MoveIntoAction,
                        referenceID: refview.value.cid,
                        activeID: targetview.value.cid,
                        oldRoot: targetview.rootID,
                        newRoot: refview.rootID,
                        anim: 'dock',
                        dockElem: that.helper[0],
                        focus: false
                    };});
                } else if (this.activeBox.type==='dropleft') {
                    $D.ActionManager.schedule(
                        function() {
                            return $D.Action.checkTextChange(targetview.header.name.text.id);
                        },
                        function() {return {
                            action: $D.PanelAction,
                            activeID: targetview.value.cid,
                            prevPanel: $D.PanelManager.prevpanel[refview.id],
                            oldRoot: targetview.rootID,
                            newRoot: 'new',
                            dockElem: that.helper[0],
                            focus: false
                        };});
                } else if (this.activeBox.type==='dropright') {
                    $D.ActionManager.schedule(
                        function() {
                            return $D.Action.checkTextChange(targetview.header.name.text.id);
                        },
                        function() {return {
                            action: $D.PanelAction,
                            activeID: targetview.value.cid,
                            prevPanel: refview.id,
                            oldRoot: targetview.rootID,
                            newRoot: 'new',
                            dockElem: that.helper[0],
                            focus: false
                        };});
                } else {
                    console.log('ERROR: Invalid boxtype');
                    debugger;
                }
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
            }
            this.activeBox = null;

            return false;
		},

        _mouseStart: function(event, overrideHandle, noActivation) {
            var that = this;
            var args = arguments;
            this.panelScrollStart = {};
            var textid = View.get(that.currentItem[0].id).header.name.text.id;
            // Correct the active textbox in case it doesn't match value.
            $('#'+textid).text($('#'+textid).val());
            $D.ActionManager.schedule(
                function() {
                  return $D.Action.checkTextChange(textid);
            });
            $.ui.sortable.prototype._mouseStart.apply(that, args);
            that.drawDropLines();
        },

        drawDropLines: function(o) {
            this._drawDropLines();
        },
        hideDropLines: function(o) {
            this._hideDropLines();
        },

		// mjs - this function is slightly modified to make it easier to hover over a collapsed element and have it expand
        _insideDropBox: function(e) {
            var i, j, d, n, p;
            $D.log(['debug','drag'],"Identifying drop-box");
            // this.position is same, scroll is different for each item

            // cache scroll-positions of each panel
            this.panels.each(function() {
                View.get(this.id).scrollY = View.get(this.id).scrollview.getScrollPosition().y;
            });

            for (i=0; i<this.items.length; ++i) {
                if (this.items[i].dropboxes == null) {continue;} // when mousedrag is called before initialization
                for (j=0; j<this.items[i].dropboxes.length; ++j) {
                    d = this.items[i].dropboxes[j];
                    var x = this.positionAbs.left + this.offset.click.left;
                    var y = this.positionAbs.top + this.offset.click.top;
                    var parentPanel = this.items[i].parentPanel;
                    y += View.get(parentPanel.attr('id')).scrollY  -
                        this.panelScrollStart[parentPanel.attr('id')];
                    if (((x>= d.left)&&(x<= d.right)) && ((y>= d.top)&&(y<= d.bottom))) {
                        if (this.scrollPanel && (parentPanel.get(0) !==
                            this.scrollPanel.get(0))) {
                            console.log("ERROR: Active panel does not match item");
                        }
                        return d;
                    }
                }
            }
            var PM = $D.PanelManager;
            // loop over panels to return correct dropbox
            for (n= 1, p=PM.leftPanel;
                 (p!=='') && (n<=PM.panelsPerScreen);
                 ++n, p = PM.nextpanel[p]) {
                var panel = View.get(p);
                if (panel.dropboxes == null) {continue;} // when mousedrag is called before initialization
                for (j=0; j<panel.dropboxes.length; ++j) {
                    d = panel.dropboxes[j];
                    var x = this.positionAbs.left + this.offset.click.left;
                    var y = this.positionAbs.top + this.offset.click.top;
                    if (((x>= d.left)&&(x<= d.right)) && ((y>= d.top)&&(y<= d.bottom))) {
                        return d;
                    }
                }
            }

            return null;
        }

	}));

	$.mjs.nestedSortable.prototype.options = $.extend({}, $.ui.sortable.prototype.options, $.mjs.nestedSortable.prototype.options);
})(jQuery);
