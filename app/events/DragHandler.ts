///<reference path="../views/View.ts"/>
///<reference path="../actions/ActionManager.ts"/>
///<reference path="../PanelManager.ts"/>
interface DragStartI {
    view: View;
    pos: PositionI;
    time: number;
    elem: HTMLElement;
}
class DragHandler {
    options:{
        grid?;
        axis?;
        expandOnHover?:boolean;
    };
    currentItem:NodeView;
    scrollPanel:PanelView; // panel being scrolled, based on mouse position
    panelScrollStart:{[id:string]:number}; // get from scrollview
    helper:JQuery;
    helperProportions:Dimensions; // replace with cache in helper-view
    mousePosition:PositionI;
    originalPosition:PositionI; // mousePosition at mousedown
    helperOffset:PositionI; // helper top/left relative to mouse
    // originalPageX:number;
    // originalPageY:number;
    activeBox:DropBox;
    hoveringBox:DropBox;
    hovering:number; // setTimeout handle for expandOnHover
    reverting:boolean; // ideally don't call dragStart at all
    constructor(options?) {
        this.options = {};
        if ($D.keyboard) {
            // override open/close keyboard methods
            $D.keyboard.softKeyboardOpen = this.softKeyboardOpen;
            $D.keyboard.softKeyboardClose = this.softKeyboardClose;
        }
        // todo: connect to panel-manager
        NodeView.refreshPositions();
    }

    public dragStart(options:DragStartI) {
        this.mousePosition = options.pos;
        var currentView:NodeView = options.view.nodeView;
        this.currentItem = currentView;
        var that = this;
        this.panelScrollStart = {};
        // Correct the active textbox in case it doesn't match value.
        // $('#' + textid).text($('#' + textid).val());
        ActionManager.schedule(
            function() {
                return Action.checkTextChange(currentView.header.name.text.id);
            });
        NodeView.refreshPositions();

        this.helper = this._createHelper();
        this._cacheHelperProportions();

        //The element's absolute position on the page
        var itemOffset = $(this.currentItem.elem).offset(); // assume zero margins
        this.helperOffset = {
                left: this.mousePosition.left - itemOffset.left,
                top: this.mousePosition.top - itemOffset.top
        };
        this.originalPosition = {
            left: this.mousePosition.left,
            top: this.mousePosition.top
        };

        // Only after we got the offset, we can change the helper's position to absolute
        // TODO: Still need to figure out a way to make relative sorting possible
        this.helper.css("position", "absolute");
        //Generate the original position

        //If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
        if (this.helper[0] !== this.currentItem.elem) {
            this.currentItem.addClass('drag-hidden');
        }
        //Recache the helper size
        this._cacheHelperProportions();
        this.helper.addClass("ui-sortable-helper");
        this.dragMove(options); //Execute the drag once - this causes the helper not to be visible before getting its correct position
        DropBox.renderAll(this);
        DropBox.previewDropBoxes();
    }

    public dragMove(options:DragStartI) {
        var i, item, itemElement, intersection,
            scrolled = false, self = this;

        this.mousePosition = options.pos;
        var helperPosition = {
            top: this.mousePosition.top - this.helperOffset.top,
            left: this.mousePosition.left - this.helperOffset.left
        };
        // define this.overflowOffset (done in _mouseStart)

        //Set the helper position
        if (!this.options.axis || this.options.axis !== "y") {
            this.helper[0].style.left = helperPosition.left + "px";
        }
        if (!this.options.axis || this.options.axis !== "x") {
            this.helper[0].style.top = helperPosition.top + "px";
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
            var pid:string;
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
            this.scrollPanel.outline.scrollHandler.scrollWhileDragging(
                this.mousePosition.top - $(this.scrollPanel.elem).offset().top);
        }
        var box:DropBox = DropBox.getHoverBox(this.mousePosition, this.panelScrollStart);

        // todo: embed hover-variables into a class?
        if ($D.timer) {clearTimeout($D.timer);}
        if (box) {
            $(box.elem).addClass('active');
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
        } else { // virtual blur
            if ($D.hoverItem) {
                $D.hoverItem.removeClass('ui-btn-hover-c');
            }
        }
        if (this.activeBox && (this.activeBox != box)) {
            $(this.activeBox.elem).removeClass('active');
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
    }

    public dragStop(options:DragStartI) {
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
            var targetview:NodeView = this.currentItem;
            if (!(refview instanceof NodeView)) {
                console.log("refview is of the wrong type with id=" + refview.id);
            }
            if (!(targetview instanceof NodeView)) {
                console.log("targetview is of the wrong type with id=" + targetview.id);
            }
            this.activeBox.handleDrop(this.currentItem, this.helper[0]);
            this.activeBox = null;
            return true;
        } else { // cancel action
            var that = this;
            var cur = $(this.currentItem.elem).offset();
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
        var newNode:HTMLElement = <HTMLElement> this.currentItem.elem.cloneNode(true);
        newNode.id = '';
        var drawlayer = View.getCurrentPage().drawlayer;
        drawlayer.elem.appendChild(newNode);
        var helper = $(newNode).css({
            position: 'absolute',
            left: $(this.currentItem.elem).offset().left + 'px',
            top: $(this.currentItem.elem).offset().top + 'px'
        });
        helper.addClass('ui-first-child').addClass('ui-last-child');
        return helper;
    }

    private _cacheHelperProportions() {
        this.helperProportions = {
            width: this.helper.outerWidth(),
            height: this.helper.outerHeight()
        };
    }

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

    private softKeyboardOpen() {
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

    private softKeyboardClose() {
//            alert("softKeyboardClose");
    }

    private _hideDropLines() {
        $('body').removeClass('drop-mode').removeClass('transition-mode');
        if (this.activeBox != null) {
            $(this.activeBox.elem).removeClass('active');
        }
    }
    public validatePanelDropBox(panel:PanelView, type:string):boolean {
        if (type==='right') {return true;}
        else if (type==='left') {
            // todo: is it in the first position
            return false;
        }
        else return false;
    }
    public validateNodeDropBox(node:NodeView, type:string):boolean {
        // cannot drop current-item on itself
        if (node === this.currentItem) {
            return false;
        }
        // cannot drop the current-item inside itself
        var activeModel = this.currentItem.value;
        var itemModel = node.value;
        var model = itemModel;
        while ((model != null) && (model !== activeModel)) {
            model = model.get('parent');
        }
        if (model != null) { // it is a child of itself
            return false;
        }
        // cannot drop current-item adjacent to itself
        if (activeModel.get('parent') === itemModel.get('parent')) {
            var aRank = activeModel.rank();
            var iRank = itemModel.rank();
            if (aRank - iRank === 1) {
                if (type==='bottom') return false;
            } else if (iRank - aRank === 1) {
                if (type==='top') return false;
            }
        }
        if (activeModel.get('parent') === itemModel) {
            if (type==='handle') return false;
        }
        var prevElement:HTMLElement = <HTMLElement>node.elem.previousSibling;
        if (prevElement && View.getFromElement(prevElement).nodeView.children.elem.children.length !== 0) {
            // predecessor has visible children, cannot drop above it
            if (type==='top') return false;
        }
        if (node.children.elem.children.length !== 0) {
            // has visible children, cannot drop below it
            if (type==='bottom') return false;
        }
        if (node.elem.nextSibling != null) {
            // not last in a list, cannot drop below it
            if (type==='bottom') return false;
        }
        return true;
    }

    private hideDropLines() {
        this._hideDropLines();
    }

}