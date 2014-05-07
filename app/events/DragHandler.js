///<reference path="../views/View.ts"/>
///<reference path="../actions/ActionManager.ts"/>
var DragHandler = (function () {
    function DragHandler(options) {
        this.options = {};
        if ($D.keyboard) {
            // override open/close keyboard methods
            $D.keyboard.softKeyboardOpen = this.softKeyboardOpen;
            $D.keyboard.softKeyboardClose = this.softKeyboardClose;
        }

        // todo: connect to panel-manager
        NodeView.refreshPositions();
    }
    DragHandler.prototype.dragStart = function (options) {
        this.mousePosition = options.pos;
        var currentView = options.view.nodeView;
        this.currentItem = currentView;
        var that = this;
        this.panelScrollStart = {};

        // Correct the active textbox in case it doesn't match value.
        // $('#' + textid).text($('#' + textid).val());
        ActionManager.schedule(function () {
            if (!View.focusedView) {
                return null;
            }
            return Action.checkTextChange(View.focusedView.header.name.text.id);
        });
        NodeView.refreshPositions();

        this.helper = this._createHelper();
        this._cacheHelperProportions();

        //The element's absolute position on the page
        var itemOffset = $(this.currentItem.elem).offset();
        this.helperOffset = {
            left: this.mousePosition.left - itemOffset.left,
            top: this.mousePosition.top - itemOffset.top
        };
        this.originalPosition = {
            left: this.mousePosition.left,
            top: this.mousePosition.top
        };

        this.currentItem.addClass('drag-hidden');

        //Recache the helper size
        this._cacheHelperProportions();
        this.scrollPanel = null;
        this.helper.addClass("ui-sortable-helper");
        this.dragMove(options); //Execute the drag once - this causes the helper not to be visible before getting its correct position
        DropBox.renderAll(this);
        DropBox.previewDropBoxes();
    };

    DragHandler.prototype.dragMove = function (options) {
        var i, item, itemElement, intersection, scrolled = false, self = this;

        this.mousePosition = options.pos;
        var helperPosition = {
            top: this.mousePosition.top - this.helperOffset.top,
            left: this.mousePosition.left - this.helperOffset.left
        };

        // define this.overflowOffset (done in _mouseStart)
        //Set the helper position
        if (!this.options.axis || this.options.axis !== "y") {
            this.helper.elem.style.left = helperPosition.left + "px";
        }
        if (!this.options.axis || this.options.axis !== "x") {
            this.helper.elem.style.top = helperPosition.top + "px";
        }
        if (this.scrollPanel) {
            var left = $(this.scrollPanel.elem).offset().left;
            var right = left + $(this.scrollPanel.elem).width();
            if (!(this.mousePosition.left >= left && this.mousePosition.left <= right)) {
                this.scrollPanel = null;
                console.log("Clearing scrollPanel");
            }
        }
        if (!this.scrollPanel) {
            var pid;
            for (pid in PanelView.panelsById) {
                var panel = PanelView.panelsById[pid];
                var left = $(panel.elem).offset().left;
                var right = left + $(panel.elem).width();
                if (self.mousePosition.left >= left && self.mousePosition.left <= right) {
                    self.scrollPanel = panel;
                    console.log("Changing scrollPanel to " + pid);
                    // console.log(self.scrollPanel);
                }
            }
        }

        // todo: initialize lists for each panel - outside nestedSortable?
        if (this.scrollPanel) {
            // do we need to initialize the panel?
            var panelid = this.scrollPanel.id;
            if (this.panelScrollStart[panelid] === undefined) {
                this.panelScrollStart[panelid] = this.scrollPanel.outline.scrollHandler.getScrollPosition().y;
            }

            // todo: add constraint?: for later panels, could scroll-position be different than the
            // scroll-position at mouse-start, which is where items are last updated?
            this.scrollPanel.outline.scrollHandler.scrollWhileDragging(this.mousePosition.top - $(this.scrollPanel.elem).offset().top);
        }
        var box = DropBox.getHoverBox(this.mousePosition, this.panelScrollStart);

        // todo: embed hover-variables into a class?
        if ($D.timer) {
            clearTimeout($D.timer);
        }
        if (box) {
            box.onHover();

            // add a virtual-hover over parent-element
            if (box.view) {
                if (box.view instanceof NodeView) {
                    if (box.view !== $D.hoverItem) {
                        $D.hoverItem.removeClass('ui-btn-hover-c');
                    }
                    box.view.addClass('ui-btn-hover-c');
                    $D.hoverItem = box.view;
                } else {
                    if ($D.hoverItem) {
                        $D.hoverItem.removeClass('ui-btn-hover-c');
                    }
                }
            }
            // $D.log(['debug', 'drag'], "Defined drop box of type" + box.type);
        } else {
            if ($D.hoverItem) {
                $D.hoverItem.removeClass('ui-btn-hover-c');
            }
        }
        if (this.activeBox && (this.activeBox != box)) {
            this.activeBox.onLeave();
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
        if (this.activeBox instanceof DropBoxHandle) {
            var hoverItem = this.activeBox.view;

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
    };

    DragHandler.prototype.dragStop = function (options) {
        var that = this;

        // mjs - clear the expansion-hovering timeout, just to be sure
        // $('.'+this.options.hoveringClass).removeClass(this.options.hoveringClass);
        this.hovering && window.clearTimeout(this.hovering);
        this.hovering = null;

        // Beginning of of prototype._mouseStop
        // End of prototype._mouseStop
        $(document.body).addClass('transition-mode').removeClass('drop-mode');
        var rootID = this.currentItem.nodeRootView.id;

        // check for active drop-target and execute move
        if (this.activeBox != null) {
            this.reverting = false;

            // console.log("Dropping with type "+this.activeBox.type+" relative to item: "+this.activeBox.item.item.attr('id'));
            var refview = this.activeBox.view;

            // todo: must set item.id for all line items, too
            // todo: must set top/left/width/height in each panel-view
            var targetview = this.currentItem;
            if (!(refview instanceof NodeView)) {
                console.log("refview is of the wrong type with id=" + refview.id);
            }
            if (!(targetview instanceof NodeView)) {
                console.log("targetview is of the wrong type with id=" + targetview.id);
            }
            this.activeBox.handleDrop(this.currentItem, this.helper);
            this.activeBox = null;
            return true;
        } else {
            var that = this;
            var cur = $(this.currentItem.elem).offset();
            this.reverting = true;
            $(this.helper.elem).animate({
                left: cur.left,
                top: cur.top
            }, 200, function () {
                that.currentItem.removeClass('drag-hidden');
                that.helper.destroy();
                that.helper = null;
                that.hideDropLines();
                that.reverting = false;
            });
            return false;
        }
    };

    DragHandler.prototype._createHelper = function () {
        var newNode = null;
        newNode = new NodeView({
            parentView: View.currentPage.drawlayer,
            value: this.currentItem.value,
            isCollapsed: this.currentItem.isCollapsed
        });
        newNode.renderAt({ parent: View.currentPage.drawlayer.elem });
        newNode.themeFirst(true);
        newNode.themeLast(true);
        $(newNode.elem).css({
            position: 'absolute',
            left: $(this.currentItem.elem).offset().left + 'px',
            top: $(this.currentItem.elem).offset().top + 'px',
            width: this.currentItem.elem.clientWidth
        });

        // fix link offsets
        var links1 = this.currentItem.header.name.listItems;
        var links2 = newNode.header.name.listItems;
        var l1, l2;
        for (l1 = links1.first(), l2 = links2.first(); (l1 !== '') && (l2 !== ''); l1 = links1.next[l1], l2 = links2.next[l2]) {
            links2.obj[l2].setOffset({
                top: links1.obj[l1].top,
                left: links1.obj[l1].left
            });
        }

        // todo: fix link-offsets for nodes inside main node
        // (<NodeLinkView>View.get(id.substr(4))).setOffset($(children[i]).position());
        return newNode;
    };

    DragHandler.prototype._cacheHelperProportions = function () {
        this.helperProportions = {
            width: $(this.helper.elem).outerWidth(),
            height: $(this.helper.elem).outerHeight()
        };
    };

    /*
    private _generatePosition(position):PositionI {
    var pageX = position.left;
    var pageY = position.top;
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
    ),
    left: (
    pageX																// The absolute mouse position
    - this.offset.click.left												// Click offset (relative to the element)
    )
    };
    }
    */
    DragHandler.prototype.softKeyboardOpen = function () {
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
    };

    DragHandler.prototype.softKeyboardClose = function () {
        //            alert("softKeyboardClose");
    };

    DragHandler.prototype._hideDropLines = function () {
        $('body').removeClass('drop-mode').removeClass('transition-mode');
        if (this.activeBox != null) {
            this.activeBox.onLeave();
        }
    };

    DragHandler.prototype.hideDropLines = function () {
        this._hideDropLines();
    };
    return DragHandler;
})();
//# sourceMappingURL=DragHandler.js.map
