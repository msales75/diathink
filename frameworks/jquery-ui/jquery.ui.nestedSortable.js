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

// MS utility addition for finding a child/parent at a fixed-depth.
(function($) {
    $.fn.childDepth = function(n) {
        var i, that = this;
        for (i=0; i<n; ++i) {
            that = that.children(':first');
            if (that.length===0) {return that;}
        }
        return that;
    }

    $.fn.parentDepth = function(n) {
        var i, that = this;
        for (i=0; i<n; ++i) {
            that = that.parent();
            if (that.length===0) {return that;}
        }
        return that;
    }

})(jQuery);

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
			rootID: null,
			rtl: false,
			startCollapsed: false,
			tabSize: 20,
            dropLayer: null,
			branchClass: 'mjs-nestedSortable-branch',
			collapsedClass: 'mjs-nestedSortable-collapsed',
			disableNestingClass: 'mjs-nestedSortable-no-nesting',
			errorClass: 'mjs-nestedSortable-error',
			expandedClass: 'mjs-nestedSortable-expanded',
			hoveringClass: 'mjs-nestedSortable-hovering',
			leafClass: 'mjs-nestedSortable-leaf'
		},

		_create: function() {
			this.element.data('ui-sortable', this.element.data('mjs-nestedSortable'));

			// mjs - prevent browser from freezing if the HTML is not correct
			if (!this.element.is(this.options.listType))
				throw new Error('nestedSortable: Please check that the listType option is set to your actual list type');

			// mjs - force 'intersect' tolerance method if we have a tree with expanding/collapsing functionality
			if (this.options.isTree && this.options.expandOnHover) {
				this.options.tolerance = 'intersect';
			}

			$.ui.sortable.prototype._create.apply(this, arguments);

			// mjs - prepare the tree by applying the right classes (the CSS is responsible for actual hide/show functionality)
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
						$li.addClass(self.options.leafClass);
					}
				})
			}
		},

		_destroy: function() {
			this.element
				.removeData("mjs-nestedSortable")
				.removeData("ui-sortable");
			return $.ui.sortable.prototype._destroy.apply(this, arguments);
		},

        _drawDropLine: function(o) {
            // todo: could move this into css classes?
            return $('<div></div>').appendTo(this.options.dropLayer)
                .css('position', 'absolute')
                .css('top', o.top+'px')
                .css('left', o.left+'px')
                .css('height', o.height+'px')
                .css('width', o.width+'px')
                .css('border', 'dashed green 1px');
        },
        _showDropLines: function() {
            this.options.dropLayer.css('display','block');
        },
        _hideDropLines: function() {
            if (this.activeBox!=null) {
                this.activeBox.elem.css('border-style','dashed');
            }
            this.options.dropLayer.css('display','none');
        },

        _drawDropLines: function() {
            // loop over items
            // determine whether to draw top or bottom line
            // determine position to draw at
            for (var i = this.items.length - 1; i >= 0; i--) {
                var item = this.items[i], itemEl = item.item;
                // add dock to above this item
                // check if this is the helper
                if (itemEl.hasClass('ui-sortable-helper')) {
                    // draw a box for where it is?
                    item.dropnull = this._drawDropLine({
                        top: item.top+2,
                        left: item.left+3,
                        width: item.width-6,
                        height: item.height-4
                    });
                    continue;
                }

                // if predecessor has no visible children, drop into topline
                if (itemEl.prev().childDepth(this.options.buryDepth).children('ul').children('li:visible').length===0) {
                    item.droptop = this._drawDropLine({
                        top: item.top-1,
                        left: item.left,
                        width: item.width,
                        height: 0
                    });
                }
                if (itemEl.childDepth(this.options.buryDepth).children('ul').children('li:visible').length === 0) {
                    // add dock to handle
                    item.drophandle = this._drawDropLine({
                        top: item.top+1,
                        left: item.left+3-16, // margin
                        width: 22,
                        height: 22
                    });
                    if (itemEl.next().length===0) { // if it's the last in a list and has no visible children
                        // add dock below this item
                        item.dropbottom = this._drawDropLine({
                            top: item.top+item.height+2-1, // +2 for border
                            left: item.left,
                            width: item.width,
                            height: 0
                        });
                    }
                }
            }
            this._showDropLines();
        },

        // cache drop-coordinates
        _updateDropBoxes: function(item) {
            var d;
            item.dropboxes = [];
            if (item.dropnull != null) {
                d = item.dropboxes[item.dropboxes.length] =
                {type: 'dropnull', elem: item.dropnull, item: item};
                d.top = item.top+2;
                d.bottom = item.top+item.height+2;
                d.left = item.left+3;
                d.right = item.left+item.width-3+2;
            }
            if (item.droptop != null) {
                d = item.dropboxes[item.dropboxes.length] =
                {type: 'droptop', elem: item.droptop, item: item};
                d.top = item.top - (item.height/2) - 1;
                d.bottom = item.top + (item.height/2) + 1;
                d.left = item.left + 12; // stay clear of handle
                d.right = item.left+item.width+2;
            }
            if (item.dropbottom != null) {
                d = item.dropboxes[item.dropboxes.length] =
                {type: 'dropbottom', elem: item.dropbottom, item: item};
                d.top = item.top + (item.height/2) - 1;
                d.bottom = item.top + (3*item.height/2) + 3;
                d.left = item.left + 12; // stay clear of handle
                d.right = item.left+item.width+2;
            }
            if (item.drophandle != null) {
                d = item.dropboxes[item.dropboxes.length] =
                {type: 'drophandle', elem: item.drophandle, item: item};
                d.top = item.top + 1;
                d.bottom = item.top + 1 + 22+2;
                d.left = item.left+3-16;
                d.right = item.left+3-16+22+2;
            }
        },
        _previewDropBoxes: function() {
            var i, j, d;
            for (i=0; i<this.items.length; ++i) {
                for (j=0; j<this.items[i].dropboxes.length; ++j) {
                    d = this.items[i].dropboxes[j];
                    $('<div></div>').appendTo(this.options.dropLayer)
                        .css('position','absolute')
                        .css('top', (d.top-1)+'px')
                        .css('left', (d.left-1)+'px')
                        .css('width', (d.right-d.left-2)+'px')
                        .css('height',(d.bottom- d.top-2)+'px')
                        .css('border','dotted red 1px');
                }
            }
        },
		_mouseDrag: function(event) {
			var i, item, itemElement, intersection,
				o = this.options,
				scrolled = false;

			//Compute the helpers position
            // relative to 'offsetParent' which is the nearest relative/absolute positioned element
			this.position = this._generatePosition(event);
			this.positionAbs = this._convertPositionTo("absolute");

			if (!this.lastPositionAbs) {
			    // only if this is the first time mousedrag is called
				this.lastPositionAbs = this.positionAbs;
			}

			//Do scrolling
			if(this.options.scroll) {
				if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML') {

					if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity) {
						this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
					} else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity) {
						this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;
					}

					if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity) {
						this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
					} else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity) {
						this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;
					}

				} else {

					if(event.pageY - $(document).scrollTop() < o.scrollSensitivity) {
						scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
					} else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity) {
						scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
					}

					if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity) {
						scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
					} else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity) {
						scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
					}

				}

				if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
					$.ui.ddmanager.prepareOffsets(this, event);
			}

			//Regenerate the absolute position used for position checks
            // (possibly different absolute-offset after scrolling)
			this.positionAbs = this._convertPositionTo("absolute");

			// mjs - find the top offset before rearrangement,
			// var previousTopOffset = this.placeholder.offset().top;

			//Set the helper position
            // TODO: change this to different coordinate system
			if(!this.options.axis || this.options.axis !== "y") {
				this.helper[0].style.left = this.position.left+"px";
			}
			if(!this.options.axis || this.options.axis !== "x") {
				this.helper[0].style.top = this.position.top+"px";
			}

			// mjs - check and reset hovering state at each cycle
            // todo: what does this do?
			this.hovering = this.hovering ? this.hovering : null;
			// this.mouseentered = this.mouseentered ? this.mouseentered : false;

			// mjs - let's start caching some variables
            // MS - get parentItem and previousItem (element refers to the li)
            // place-holder goes in the spot, unlike helper
            /*
			var parentItem = (this.placeholder.parentDepth(o.buryDepth+2).get(0) && 
                                this.placeholder.parentDepth(o.buryDepth+2).closest('.ui-sortable').length)
                                ? this.placeholder.parentDepth(o.buryDepth+2)
                                : null;


			var level = this._getLevel(this.placeholder),
			    childLevels = this._getChildLevels(this.helper);
             */

			// var newList = document.createElement(o.listType);

            var box = this._insideDropBox();
            if (box) {
                box.elem.css('border-style','solid');
            }
            if (this.activeBox && (this.activeBox!=box)) {
                this.activeBox.elem.css('border-style','dashed');
            }
            this.activeBox = box;


            //Rearrange
            for (i = this.items.length - 1; i >= 0; i--) {

                //Cache variables and intersection, continue if no intersection
                item = this.items[i];
                itemElement = item.item[0];

                // MS - new intersection criteria via topline and bottomline


                intersection = this._intersectsWithPointer(item);
                if (!intersection) {
                    continue;
                }

                // Only put the placeholder inside the current Container, skip all
                // items form other containers. This works because when moving
                // an item from one container to another the
                // currentContainer is switched before the placeholder is moved.
                //
                // Without this moving items in "sub-sortables" can cause the placeholder to jitter
                // beetween the outer and inner container.
                if (item.instance !== this.currentContainer) {
                    continue;
                }

                // cannot intersect with itself
                // no useless actions that have been done before
                // no action if the item moved is the parent of the item checked
                if (itemElement !== this.currentItem[0] &&
                    this.placeholder[intersection === 1 ? "next" : "prev"]()[0] !== itemElement &&
                    !$.contains(this.placeholder[0], itemElement) &&
                    (this.options.type === "semi-dynamic" ? !$.contains(this.element[0], itemElement) : true)
                    ) {

                    // mjs - we are intersecting an element: trigger the mouseenter event and store this state
                    // if (!this.mouseentered) {
                        // MS - do not call mouseenter any more?
                        // $(itemElement).mouseenter();
                        // this.mouseentered = true;
                    // }

                    // mjs - if the element has children and they are hidden, show them after a delay (CSS responsible)
                    if (o.isTree && $(itemElement).hasClass(o.collapsedClass) && o.expandOnHover) {
                        if (!this.hovering) {
                            // $(itemElement).addClass(o.hoveringClass);
                            var self = this;
                            this.hovering = window.setTimeout(function() {
                                $(itemElement).removeClass(o.collapsedClass).addClass(o.expandedClass);
                                self.refreshPositions();
                                self._trigger("expand", event, self._uiHash());
                            }, o.expandOnHover);
                        }
                    }

                    this.direction = intersection == 1 ? "down" : "up";

                    // mjs - rearrange the elements and reset timeouts and hovering state
                    if (this.options.tolerance == "pointer" || this._intersectsWithSides(item)) {
                        // $(itemElement).mouseleave(); // MS - disable mouselave
                        // this.mouseentered = false;
                        // $(itemElement).removeClass(o.hoveringClass);
                        this.hovering && window.clearTimeout(this.hovering);
                        this.hovering = null;

                        // mjs - do not switch container if it's a root item and 'protectRoot' is true
                        // or if it's not a root item but we are trying to make it root
                        if (o.protectRoot
                            && ! (this.currentItem[0].parentNode == this.element[0] // it's a root item
                            && itemElement.parentNode != this.element[0]) // it's intersecting a non-root item
                            ) {
                            if (this.currentItem[0].parentNode != this.element[0]
                                && itemElement.parentNode == this.element[0]
                                ) {

                                if ( ! $(itemElement).childDepth(o.buryDepth).children(o.listType).children().length) {
                                    if ( ! $(itemElement).childDepth(o.buryDepth).children(o.listType).length) {
                                        $(itemElement).childDepth(o.buryDepth).get(0).appendChild(newList);
                                    }
                                    o.isTree && $(itemElement).removeClass(o.leafClass).addClass(o.branchClass + ' ' + o.expandedClass);
                                }

                                var a = this.direction === "down" ? $(itemElement).prev().childDepth(o.buryDepth).children(o.listType) : $(itemElement).childDepth(o.buryDepth).children(o.listType);
                                if (a[0] !== undefined) {
                                    // MS - do not move item yet
                                    this._rearrange(event, null, a);
                                }

                            } else {
                                // MS - do not move item yet
                                this._rearrange(event, item);
                            }
                        } else if ( ! o.protectRoot) {
                            // MS - do not move item yet
                            // this._rearrange(event, item);
                        }
                    } else {
                        break;
                    }

                    // Clear emtpy ul's/ol's
                    this._clearEmpty(itemElement);

                    this._trigger("change", event, this._uiHash());
                    break;
                }
            }
            // mjs - to find the previous sibling in the list, keep backtracking until we hit a valid list item.
            /*
            var previousItem = this.placeholder[0].previousSibling ? $(this.placeholder[0].previousSibling) : null;
            if (previousItem != null) {
                while (previousItem[0].nodeName.toLowerCase() != 'li' || previousItem[0] == this.currentItem[0] || previousItem[0] == this.helper[0]) {
                    if (previousItem[0].previousSibling) {
                        previousItem = $(previousItem[0].previousSibling);
                    } else {
                        previousItem = null;
                        break;
                    }
                }
            }

            // mjs - to find the next sibling in the list, keep stepping forward until we hit a valid list item.
            var nextItem = this.placeholder[0].nextSibling ? $(this.placeholder[0].nextSibling) : null;
            if (nextItem != null) {
                while (nextItem[0].nodeName.toLowerCase() != 'li' || nextItem[0] == this.currentItem[0] || nextItem[0] == this.helper[0]) {
                    if (nextItem[0].nextSibling) {
                        nextItem = $(nextItem[0].nextSibling);
                    } else {
                        nextItem = null;
                        break;
                    }
                }
            }
            */

            this.beyondMaxLevels = 0;

            // mjs - if the item is moved to the left, send it one level up but only if it's at the bottom of the list
            /*
            if (parentItem != null
                && nextItem == null
                && ! (o.protectRoot && parentItem[0].parentNode == this.element[0])
                &&
                (o.rtl && (this.positionAbs.left + this.helper.outerWidth() > parentItem.offset().left + parentItem.outerWidth())
                    || ! o.rtl && (this.positionAbs.left < parentItem.offset().left))
                ) {

                parentItem.after(this.placeholder[0]);
                if (o.isTree && parentItem.childDepth(o.buryDepth).children(o.listType).children('li:visible:not(.ui-sortable-helper)').length < 1) {
                    parentItem.removeClass(this.options.branchClass)
                        .addClass(this.options.leafClass);
                    console.log(this.helper);
                }
                this._clearEmpty(parentItem[0]);
                this._trigger("change", event, this._uiHash());
            }
            // mjs - if the item is below a sibling and is moved to the right, make it a child of that sibling
            else if (previousItem != null
                && ! previousItem.hasClass(o.disableNestingClass)
                &&
                (previousItem.childDepth(o.buryDepth).children(o.listType).children().length && previousItem.childDepth(o.buryDepth).children(o.listType).is(':visible')
                    || ! previousItem.childDepth(o.buryDepth).children(o.listType).children().length)
                && ! (o.protectRoot && this.currentItem[0].parentNode == this.element[0])
                &&
                (o.rtl && (this.positionAbs.left + this.helper.outerWidth() < previousItem.offset().left + previousItem.outerWidth() - o.tabSize)
                    || ! o.rtl && (this.positionAbs.left > previousItem.offset().left + o.tabSize))
                ) {

                this._isAllowed(previousItem, level, level+childLevels+1);

                if (!previousItem.childDepth(o.buryDepth).children(o.listType).length) {
                    previousItem.childDepth(o.buryDepth).get(0).appendChild(newList);
                }

                if (!previousItem.childDepth(o.buryDepth).children(o.listType).children().length) {
                    o.isTree && previousItem.removeClass(o.leafClass).addClass(o.branchClass + ' ' + o.expandedClass);
                }

                // mjs - if this item is being moved from the top, add it to the top of the list.
                if (previousTopOffset && (previousTopOffset <= previousItem.offset().top)) {
                    previousItem.childDepth(o.buryDepth).children(o.listType).prepend(this.placeholder);
                }
                // mjs - otherwise, add it to the bottom of the list.
                else {
                    previousItem.childDepth(o.buryDepth).children(o.listType)[0].appendChild(this.placeholder[0]);
                }

                this._trigger("change", event, this._uiHash());
            }
            else {
                this._isAllowed(parentItem, level, level+childLevels);
            }
            */

            //Post events to containers
            // MS - not sure how this works yet
            this._contactContainers(event);

            //Interconnect with droppables
            if($.ui.ddmanager) {
                $.ui.ddmanager.drag(this, event);
            }

            //Call callbacks
            this._trigger('sort', event, this._uiHash());

            this.lastPositionAbs = this.positionAbs;
            return false;

        },

		_mouseStop: function(event, noPropagation) {

			// mjs - if the item is in a position not allowed, send it back


			if (this.beyondMaxLevels) {
            /*
				this.placeholder.removeClass(this.options.errorClass);

				if (this.domPosition.prev) {
					$(this.domPosition.prev).after(this.placeholder);
				} else {
					$(this.domPosition.parent).prepend(this.placeholder);
				}
				*/

				this._trigger("revert", event, this._uiHash());

			}


			// mjs - clear the hovering timeout, just to be sure
			// $('.'+this.options.hoveringClass).mouseleave().removeClass(this.options.hoveringClass);
			// this.mouseentered = false;
			this.hovering && window.clearTimeout(this.hovering);
			this.hovering = null;
            // hide boxes
            this._hideDropLines();

            // Beginning of of prototype._mouseStop
            // $.ui.sortable.prototype._mouseStop.apply(this, arguments);

            if(!event) return;

            //If we are using droppables, inform the manager about the drop
            if ($.ui.ddmanager && !this.options.dropBehaviour)
                $.ui.ddmanager.drop(this, event);


            if(this.options.revert) { // MS Note that this won't work without placeholder
                var that = this;
                var cur = this.placeholder.offset();

                this.reverting = true;

                $(this.helper).animate({
                    left: cur.left - this.offset.parent.left - this.margins.left + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollLeft),
                    top: cur.top - this.offset.parent.top - this.margins.top + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollTop)
                }, parseInt(this.options.revert, 10) || 500, function() {
                    that._clear(event);
                });
            } else {
                this._clear(event, noPropagation);
            }
            // End of prototype._mouseStop

            // check for active drop-target and execute move
            if (this.activeBox != null) {
                console.log("Dropping with type "+this.activeBox.type+" relative to item: "+this.activeBox.item.item.attr('id'));
            }
            this.activeBox = null;

            return false;
		},

        _mouseStart: function(event, overrideHandle, noActivation) {

            $.ui.sortable.prototype._mouseStart.apply(this, arguments);
            // MS Warning todo: - this creates a placeholder

            this._drawDropLines();
            for (var i=0; i < this.items.length; ++i) {
                this._updateDropBoxes(this.items[i]);
            }
            // this._previewDropBoxes();
        },

		// mjs - this function is slightly modified to make it easier to hover over a collapsed element and have it expand
		_intersectsWithSides: function(item) {

			var half = this.options.isTree ? .8 : .5;

			var isOverBottomHalf = isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height*half), item.height),
                isOverTopHalf = isOverAxis(this.positionAbs.top + this.offset.click.top, item.top - (item.height*half), item.height),
				isOverRightHalf = isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width/2), item.width),
				verticalDirection = this._getDragVerticalDirection(),
				horizontalDirection = this._getDragHorizontalDirection();

			if (this.floating && horizontalDirection) {
				return ((horizontalDirection == "right" && isOverRightHalf) || (horizontalDirection == "left" && !isOverRightHalf));
			} else {
				return verticalDirection && ((verticalDirection == "down" && isOverBottomHalf) || (verticalDirection == "up" && isOverTopHalf));
			}

		},
        _insideDropBox: function(e) {
            var i, j, d;
            for (i=0; i<this.items.length; ++i) {
                if (this.items[i].dropboxes == null) {continue;} // when mousedrag is called before initialization
                for (j=0; j<this.items[i].dropboxes.length; ++j) {
                    d = this.items[i].dropboxes[j];
                    var x = this.positionAbs.left + this.offset.click.left;
                    var y = this.positionAbs.top + this.offset.click.top;
                    if (((x>= d.left)&&(x<= d.right)) && ((y>= d.top)&&(y<= d.bottom))) {
                        return d;
                    }
                }
            }
            return null;
        },

		_contactContainers: function(event) {

			if (this.options.protectRoot && this.currentItem[0].parentNode == this.element[0] ) {
				return;
			}

			$.ui.sortable.prototype._contactContainers.apply(this, arguments);
            // todo: MS warning - this updates the placeholder, and calls _rearrange
            // (contactContainers needs to be adjusted)

		},

        // MS - incorporating _clear code from sortable.js to customize
        _clear: function(event, noPropagation) {

            this.reverting = false;
            // We delay all events that have to be triggered to after the point where the placeholder has been removed and
            // everything else normalized again
            var delayedTriggers = [];

            // We first have to update the dom position of the actual currentItem
            // Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)

            // MS - do not use placeholder to place currentItem, but we still have
            //  to remove it after it was created in _mouseStart

            // if(!this._noFinalSort && this.currentItem.parent().length) this.placeholder.before(this.currentItem);
            // this._noFinalSort = null;

            if(this.helper[0] == this.currentItem[0]) {
                for(var i in this._storedCSS) {
                    if(this._storedCSS[i] == 'auto' || this._storedCSS[i] == 'static') this._storedCSS[i] = '';
                }
                this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
            } else {
                this.currentItem.show();
            }
            /*
            if (this.placeholder[0].parentNode.tagName.toLowerCase()!== 'ul') {
                console.log("ERROR: place-holder was not added at a valid location, before currentItem addition");
            }*/
            if (this.currentItem[0].parentNode.tagName.toLowerCase()!== 'ul') {
                console.log("ERROR: current-item was not added at a valid location");
            }

            if(this.fromOutside && !noPropagation) delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
            if((this.fromOutside || this.domPosition.prev != this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent != this.currentItem.parent()[0]) && !noPropagation) delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed

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
            this.helper.css("zIndex", ''); //Reset z-index

            this.dragging = false;
            if(this.cancelHelperRemoval) {
                if(!noPropagation) {
                    this._trigger("beforeStop", event, this._uiHash());
                    for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
                    this._trigger("stop", event, this._uiHash());
                }

                this.fromOutside = false;
                return false;
            }

            if(!noPropagation) this._trigger("beforeStop", event, this._uiHash());

            /*
            if (this.placeholder[0].parentNode.tagName.toLowerCase() !== 'ul') {
                console.log("ERROR: place-holder was not in correct spot before being removed");
            }*/

            //$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
            // MS remove it here, since it was probably created in _mouseStart
            if (this.placeholder && (this.placeholder.length>0)) {
                this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
            }

            if(this.helper[0] != this.currentItem[0]) this.helper.remove(); this.helper = null;

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

            return true;

        },

        serialize: function(options) {

			var o = $.extend({}, this.options, options),
				items = this._getItemsAsjQuery(o && o.connected),
			    str = [];

			$(items).each(function() {
				var res = ($(o.item || this).attr(o.attribute || 'id') || '')
						.match(o.expression || (/(.+)[-=_](.+)/)),
				    pid = ($(o.item || this).parent(o.listType).parentDepth(o.buryDepth)
						.parent(o.items)
						.attr(o.attribute || 'id') || '')
						.match(o.expression || (/(.+)[-=_](.+)/));

				if (res) {
					str.push(((o.key || res[1]) + '[' + (o.key && o.expression ? res[1] : res[2]) + ']')
						+ '='
						+ (pid ? (o.key && o.expression ? pid[1] : pid[2]) : o.rootID));
				}
			});

			if(!str.length && o.key) {
				str.push(o.key + '=');
			}

			return str.join('&');

		},

		toHierarchy: function(options) {

			var o = $.extend({}, this.options, options),
				sDepth = o.startDepthCount || 0,
			    ret = [];

			$(this.element).children(o.items).each(function () {
				var level = _recursiveItems(this);
				ret.push(level);
			});

			return ret;

			function _recursiveItems(item) {
				var id = ($(item).attr(o.attribute || 'id') || '').match(o.expression || (/(.+)[-=_](.+)/));
				if (id) {
					var currentItem = {"id" : id[2]};
					if ($(item).childDepth(o.buryDepth).children(o.listType).children(o.items).length > 0) {
						currentItem.children = [];
						$(item).childDepth(o.buryDepth).children(o.listType).children(o.items).each(function() {
							var level = _recursiveItems(this);
							currentItem.children.push(level);
						});
					}
					return currentItem;
				}
			}
		},

		toArray: function(options) {

			var o = $.extend({}, this.options, options),
				sDepth = o.startDepthCount || 0,
			    ret = [],
			    left = 1;

			if (!o.excludeRoot) {
				ret.push({
					"item_id": o.rootID,
					"parent_id": null,
					"depth": sDepth,
					"left": left,
					"right": ($(o.items, this.element).length + 1) * 2
				});
				left++
			}

			$(this.element).children(o.items).each(function () {
				left = _recursiveArray(this, sDepth + 1, left);
			});

			ret = ret.sort(function(a,b){ return (a.left - b.left); });

			return ret;

			function _recursiveArray(item, depth, left) {

				var right = left + 1,
				    id,
				    pid;

				if ($(item).childDepth(o.buryDepth).children(o.listType).children(o.items).length > 0) {
					depth ++;
					$(item).childDepth(o.buryDepth).children(o.listType).children(o.items).each(function () {
						right = _recursiveArray($(this), depth, right);
					});
					depth --;
				}

				id = ($(item).attr(o.attribute || 'id')).match(o.expression || (/(.+)[-=_](.+)/));

				if (depth === sDepth + 1) {
					pid = o.rootID;
				} else {
					var parentItem = ($(item).parent(o.listType).parentDepth(o.buryDepth)
											 .parent(o.items)
											 .attr(o.attribute || 'id'))
											 .match(o.expression || (/(.+)[-=_](.+)/));
					pid = parentItem[2];
				}

				if (id) {
						ret.push({"item_id": id[2], "parent_id": pid, "depth": depth, "left": left, "right": right});
				}

				left = right + 1;
				return left;
			}

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

		_getLevel: function(item) {

			var level = 1;

			if (this.options.listType) {
				var list = item.closest(this.options.listType);
				while (list && list.length > 0 &&
                    	!list.is('.ui-sortable')) {
					level++;
					list = list.parent().closest(this.options.listType);
				}
			}

			return level;
		},

		_getChildLevels: function(parent, depth) {
			var self = this,
			    o = this.options,
			    result = 0;
			depth = depth || 0;

			$(parent).childDepth(o.buryDepth).children(o.listType).children(o.items).each(function (index, child) {
					result = Math.max(self._getChildLevels(child, depth + 1), result);
			});

			return depth ? result + 1 : result;
		},

		_isAllowed: function(parentItem, level, levels) {
			var o = this.options,
				maxLevels = this.placeholder.closest('.ui-sortable').nestedSortable('option', 'maxLevels'); // this takes into account the maxLevels set to the recipient list

			// mjs - is the root protected?
			// mjs - are we nesting too deep?
			if ( ! o.isAllowed(this.placeholder, parentItem, this.currentItem)) {
					this.placeholder.addClass(o.errorClass);
					if (maxLevels < levels && maxLevels != 0) {
						this.beyondMaxLevels = levels - maxLevels;
					} else {
						this.beyondMaxLevels = 1;
					}
			} else {
				if (maxLevels < levels && maxLevels != 0) {
					this.placeholder.addClass(o.errorClass);
					this.beyondMaxLevels = levels - maxLevels;
				} else {
					this.placeholder.removeClass(o.errorClass);
					this.beyondMaxLevels = 0;
				}
			}
		}

	}));

	$.mjs.nestedSortable.prototype.options = $.extend({}, $.ui.sortable.prototype.options, $.mjs.nestedSortable.prototype.options);
})(jQuery);
