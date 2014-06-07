var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/GridView.js");
var PanelGridView = (function (_super) {
    __extends(PanelGridView, _super);
    function PanelGridView() {
        _super.apply(this, arguments);
        this.cssClass = "scroll-container horizontal-grid";
    }
    PanelGridView.prototype.init = function () {
        this.childViewTypes = {
            gridRightLine: GridRightLineView
        };
        this.listItemTemplate = PanelView;
        this.numCols = 2;
        this.listItems = new LinkedList();
        this.value = new LinkedList();
        this.hideList = false;
    };

    PanelGridView.prototype.render = function () {
        this._create({
            type: 'div',
            classes: this.cssClass,
            html: ''
        });
        this.gridRightLine.render();
        this.insertListItems();
        this.elem.insertBefore(this.gridRightLine.elem, null);
        this.setPosition();
        return this.elem;
    };

    PanelGridView.prototype.updateCols = function () {
        var width = View.currentPage.layout.width;
        var oldNumCols = this.numCols;
        var id;
        if (width < 880) {
            this.numCols = 1;
        } else if (width < 1500) {
            this.numCols = 2;
        } else {
            this.numCols = 3;
        }
        /*
        if (oldNumCols !== this.numCols) {
        if (this.value && (this.value.count > 1)) {
        if (oldNumCols > this.numCols) {
        this.clipPanel('right');
        } else if (oldNumCols < this.numCols) {
        this.fillPanel('right', true);
        }
        }
        }
        */
    };

    PanelGridView.prototype.updateValue = function () {
    };

    PanelGridView.prototype.layoutDown = function () {
        var p = this.parentView.layout;

        // when not expanded for more hidden panels
        this.layout = {
            top: 0,
            height: p.height,
            left: 0,
            width: p.width
        };
        this.itemWidth = Math.floor((this.layout.width - 2) / this.numCols);
    };

    PanelGridView.prototype.getInsertLocation = function (prevPanel) {
        if (this.listItems.next[prevPanel] === '') {
            return prevPanel;
        } else {
            return this.listItems.next[prevPanel];
        }
    };

    // do nothing unless there are more panels than visible
    //  then remove left-most or right-most one & fix grid-dimensions
    PanelGridView.prototype.clipPanel = function (dir) {
        // if (this.layout.width >= (this.numCols+1)*this.itemWidth) {
        if (dir === 'left') {
            var firstPanel = this.listItems.obj[this.listItems.first()];
            firstPanel.destroy();
        } else if (dir === 'right') {
            var lastPanel = this.listItems.obj[this.listItems.last()];
            lastPanel.destroy(); // destroy removes from listItems but not from value
        }

        // }
        this.layout.left = 0;
        this.layout.width = this.numCols * this.itemWidth + 2;
        this.positionChildren(null);
        this.setPosition();
    };

    // inserts panel into view after prevPanel, positioned after prevPanel's width+offsetPosition
    // renders new panel and repositions following panels with positionChildren
    // returns slide-direction: slide right unless new panel is on the right end of the screen, then left
    PanelGridView.prototype.insertViewAfter = function (prevPanel, panel, offsetPosition) {
        var id, previd;

        // update the view-list
        id = panel.id;
        assert(this.listItems.obj[id] === undefined, "panel is already in list");
        if (prevPanel == null) {
            previd = '';
        } else {
            previd = prevPanel.id;
            assert(this.listItems.obj[previd] != null, "insertAfter has unknown previous id");
        }
        this.listItems.insertAfter(panel.id, panel, previd);

        // update value to include reference based on view (hmm this seems sloppy)
        // update DOM
        if (this.elem) {
            if (!panel.elem) {
                if (previd === '') {
                    panel.layout.left = 0;
                } else {
                    var prevLayout = View.get(previd).layout;
                    panel.layout.left = prevLayout.left + prevLayout.width;
                }
                if (offsetPosition) {
                    panel.layout.left += offsetPosition;
                }
                panel.render();
                this.positionChildren(panel); // a hidden panel can preserve a gap
            }
            var nextPanel = this.listItems.next[id];
            if (nextPanel === '') {
                this.elem.appendChild(panel.elem);
            } else {
                this.elem.insertBefore(panel.elem, this.listItems.obj[nextPanel].elem);
            }
        }
        var dir = 'right';
        if (id === this.listItems.last()) {
            dir = 'left';
        }
        this.updatePanelButtons();
        return dir;
    };

    PanelGridView.prototype.insertAfter = function (prevPanel, panel, offsetPosition) {
        var id, previd;
        assert(panel !== null, "No panel given to insert");
        id = panel.id;
        assert(this.value.next[id] === undefined, "panel is already in list");
        if (prevPanel == null) {
            if (this.value.count === 0) {
                previd = '';
            } else {
                assert(this.listItems.count > 0, "value is non-empty but listItems are empty");
                previd = this.value.prev[this.listItems.first()];
                // console.log("In insertAfter with prevPanel=null, setting previd="+previd+
                //    " before first visible panel "+this.listItems.first());
            }
        } else {
            previd = prevPanel.id;
            assert(this.value.obj[previd] === true, "insertAfter has unknown previous id");
        }
        this.value.insertAfter(panel.id, true, previd);
        return this.insertViewAfter(prevPanel, panel, offsetPosition);
    };

    PanelGridView.prototype.append = function (panel) {
        return this.insertAfter(this.listItems.obj[this.listItems.last()], panel);
    };

    PanelGridView.prototype.prepend = function (panel) {
        return this.insertAfter(null, panel);
    };

    PanelGridView.prototype.getNewPanelSide = function (prefDir) {
        var isPanelToLeft = (this.listItems.first() !== this.value.first());
        var isPanelToRight = (this.listItems.last() !== this.value.last());
        if (!isPanelToLeft) {
            return 'right';
        } else if (isPanelToLeft && !isPanelToRight) {
            return 'left';
        } else {
            if (prefDir === 'left') {
                return 'left';
            }
            return 'right';
        }
    };

    PanelGridView.prototype.fillPanel = function (prefDir, force) {
        var direction;
        if (force) {
            direction = prefDir;
        } else {
            direction = this.getNewPanelSide(prefDir);
        }

        if (direction === 'right') {
            this.showNextRight();
        } else if (direction === 'left') {
            this.showPrevLeft();
        }
        return direction;
    };

    PanelGridView.prototype.detach = function (panel, slide) {
        if (panel instanceof PanelView) {
            var id = panel.id;
            var mid = panel.value.cid;
            var filler;
            var fPanel = null;

            // remove panel from listItems-list
            // don't destroy it here, just detach it
            // but don't remove it from value here, it might just become invisible
            this.listItems.remove(panel.id);
        }
        if (panel.elem && panel.elem.parentNode) {
            panel.elem.parentNode.removeChild(panel.elem);
        }
    };

    PanelGridView.prototype.showPrevLeft = function () {
        var leftPanel = this.listItems.obj[this.listItems.first()];
        var prev = this.value.prev[leftPanel.id];
        if (prev === '') {
            console.log("Not showing prev-left because nothing to show");
            return;
        } else {
            var deadPanel = DeadView.viewList[prev];
            assert(deadPanel instanceof DeadPanel, "Cannot find panel in graveyard");
            var newPanel = deadPanel.resurrect();
            this.insertViewAfter(null, newPanel);
        }
    };

    PanelGridView.prototype.showNextRight = function (positionOffset) {
        var rightPanel = this.listItems.obj[this.listItems.last()];
        var next = this.value.next[rightPanel.id];
        if (next === '') {
            console.log("Not showing next-right because nothing to show");
            return;
        } else {
            var deadPanel = DeadView.viewList[next];
            assert(deadPanel instanceof DeadPanel, "Cannot find panel in graveyard");
            var newPanel = deadPanel.resurrect();
            this.insertViewAfter(rightPanel, newPanel, positionOffset);
        }
    };

    PanelGridView.prototype.updatePanelButtons = function () {
        var content = View.getCurrentPage().content;
        var l = $('#' + content.leftbutton.id);
        var r = $('#' + content.rightbutton.id);
        var n, p;
        var allowleft = false, allowright = false;
        if (this.value.next[''] !== this.listItems.next['']) {
            allowleft = true;
        }
        if (this.value.prev[''] !== this.listItems.prev['']) {
            allowright = true;
        }
        if (allowleft) {
            l.css('visibility', 'visible');
        } else {
            l.css('visibility', 'hidden');
        }
        if (allowright) {
            r.css('visibility', 'visible');
        } else {
            r.css('visibility', 'hidden');
        }

        // update delete-button visibility
        if (this.elem) {
            var i;
            for (i in this.listItems.obj) {
                this.listItems.obj[i].deletebutton.renderUpdate();
            }
        }
    };

    PanelGridView.prototype.positionChildren = function (v, v2, validate) {
        this.itemWidth = Math.floor((this.parentView.layout.width - 2) / this.numCols);
        var c = this.listItems.first();
        var w = 0;
        if (v != null) {
            w = v.layout.left + v.layout.width;
            c = this.listItems.next[v.id];
        }
        for (; c !== ''; c = this.listItems.next[c]) {
            var child = this.listItems.obj[c];
            if (!child.layout) {
                child.layout = {};
            }
            if (child.layout.left !== w) {
                if (validate) {
                    assert(false, "Panel has invalid left " + child.id);
                }
                child.layout.left = w;
                if (child.elem) {
                    $(child.elem).css('left', w + 'px');
                }
            }
            w += child.layout.width;
        }
        if (validate) {
            assert(this.gridRightLine.layout.left === w, "Gridrightline has wrong left");
        }
        this.gridRightLine.layout.left = w;
        if (this.elem) {
            this.gridRightLine.elem.style.left = w + 'px';
        }
    };

    PanelGridView.prototype.swipeStart = function (params) {
        this.swipeParams = {};
        this.swipeParams.start = params;
    };

    PanelGridView.prototype.swipeMove = function (params) {
        // store last two moves for calculating release-speed in swipeStop
        if (!this.swipeParams.start) {
            return;
        }
        if (this.swipeParams.last) {
            this.swipeParams.prev = this.swipeParams.last;
        } else {
            this.swipeParams.prev = this.swipeParams.start;
        }
        this.swipeParams.last = params;
        var swipeDiff = this.getSwipeDiff(this.swipeParams.last, this.swipeParams.start);
        if (swipeDiff > 0) {
            if (this.value.next[''] !== this.listItems.next['']) {
                this.layout.left = Math.round(swipeDiff);
                this.elem.style.left = String(this.layout.left) + 'px';
            }
        } else if (swipeDiff < 0) {
            if (this.value.prev[''] !== this.listItems.prev['']) {
                this.layout.left = Math.round(swipeDiff);
                this.elem.style.left = String(this.layout.left) + 'px';
            }
        }
    };

    PanelGridView.prototype.getSwipeDiff = function (p1, p2) {
        var oldx = p2.pos.left;
        var newx = p1.pos.left;
        return newx - oldx;
    };

    PanelGridView.prototype.swipeStop = function (params) {
        // if no-swipe, remove hint of motion
        // otherwise start modified animation
        var speed = this.getSwipeDiff(this.swipeParams.last, this.swipeParams.prev);
        var dist = this.getSwipeDiff(this.swipeParams.last, this.swipeParams.start);
        if ((speed > 1) && (dist > 1)) {
            if (this.value.next[''] !== this.listItems.next['']) {
                ActionManager.simpleSchedule(View.focusedView, function () {
                    return {
                        actionType: SlidePanelsAction,
                        name: 'Swipe right',
                        direction: 'right',
                        speed: 80,
                        focus: false
                    };
                });
            }
        } else if ((speed < -1) && (dist < -1)) {
            if (this.value.prev[''] !== this.listItems.prev['']) {
                ActionManager.simpleSchedule(View.focusedView, function () {
                    return {
                        actionType: SlidePanelsAction,
                        name: 'Swipe left',
                        direction: 'left',
                        speed: 80,
                        focus: false
                    };
                });
            }
        } else {
            // restore location - animate this?
            this.layout.left = 0;
            this.elem.style.left = '0px';
        }
    };

    PanelGridView.prototype.validate = function () {
        var p;
        _super.prototype.validate.call(this);
        assert(this.listItems.count === _.size(PanelView.panelsById), "Wrong number of panels for grid-count");
        for (p = this.listItems.first(); p !== ''; p = this.listItems.next[p]) {
            assert(this.value.obj[p] === true, "Value does not match listItems panel " + p);
            if (this.listItems.next[p] !== '') {
                assert(this.value.next[p] === this.listItems.next[p], "Value does not match listItems sequence panel " + p);
            }
        }
        for (p in this.value.obj) {
            assert(this.value.obj[p] === true, "Panel list value is not set to null" + p);
            if (this.listItems.obj[p] === undefined) {
                assert(DeadView.viewList[p] instanceof DeadPanel, "Dead panel does not exist " + p);
            }
        }
        assert(this.listItems.count <= this.numCols, "Cannot have more panels than columns");
        if (this.listItems.count < this.numCols) {
            // assert(this.listItems.count===this.value.count,
            //     "Cannot have empty panel-slots when there are more to show");
        }
    };
    return PanelGridView;
})(View);
//# sourceMappingURL=PanelGridView.js.map
