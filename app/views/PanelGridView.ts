///<reference path="View.ts"/>
m_require("app/views/GridView.js");
class PanelGridView extends View {
    parentView:GridContainerView;
    cssClass = "scroll-container horizontal-grid";
    value:LinkedList<boolean>; // list of models for panels
    listItems:LinkedList<PanelView>; // list of rendered views based on models
    swipeParams:{start?:DragStartI; prev?:DragStartI; last?:DragStartI};
    gridRightLine:GridRightLineView;
    numCols:number;
    itemWidth:number;

    init() {
        this.childViewTypes = {
            gridRightLine: GridRightLineView
        };
        this.listItemTemplate = PanelView;
        this.numCols = 2;
        this.listItems = new LinkedList<PanelView>();
        this.value = new LinkedList<boolean>();
        this.hideList = false;
    }

    render() {
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
    }

    updateCols() {
        var width = View.currentPage.layout.width;
        var oldNumCols = this.numCols;
        var id:string;
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
    }

    updateValue() {
    }

    layoutDown() {
        var p:Layout = this.parentView.layout;
        // when not expanded for more hidden panels
        this.layout = {
            top: 0,
            height: p.height,
            left: 0, // not always
            width: p.width // not always
        };
        this.itemWidth = Math.floor((this.layout.width-2) / this.numCols);
    }

    getInsertLocation(prevPanel:string):string {
        if (this.listItems.next[prevPanel] === '') {
            return prevPanel;
        } else {
            return this.listItems.next[prevPanel];
        }
    }

    // do nothing unless there are more panels than visible
    //  then remove left-most or right-most one & fix grid-dimensions
    clipPanel(dir:string) {
        // if (this.layout.width >= (this.numCols+1)*this.itemWidth) {
            if (dir === 'left') {
                var firstPanel:PanelView = <PanelView>this.listItems.obj[this.listItems.first()];
                firstPanel.destroy();
            } else if (dir === 'right') {
                var lastPanel:PanelView = <PanelView>this.listItems.obj[this.listItems.last()];
                lastPanel.destroy(); // destroy removes from listItems but not from value
            }
        // }
        this.layout.left = 0;
        this.layout.width = this.numCols * this.itemWidth + 2;
        this.positionChildren(null);
        this.setPosition();
    }

    // inserts panel into view after prevPanel, positioned after prevPanel's width+offsetPosition
    // renders new panel and repositions following panels with positionChildren
    // returns slide-direction: slide right unless new panel is on the right end of the screen, then left
    insertViewAfter(prevPanel:PanelView, panel:PanelView, offsetPosition?:number):string {
        var id:string, previd:string; // viewid's
        // update the view-list
        id = panel.id;
        assert(this.listItems.obj[id] === undefined, "panel is already in list");
        if (prevPanel == null) {
            previd = '';
        } else {
            previd = prevPanel.id;
            assert(this.listItems.obj[previd] != null,
                "insertAfter has unknown previous id");
        }
        this.listItems.insertAfter(panel.id, panel, previd);
        // update value to include reference based on view (hmm this seems sloppy)
        // update DOM
        if (this.elem) { // render panels if the grid is currently rendered
            if (!panel.elem) {
                if (previd === '') {// insert to far left
                    panel.layout.left = 0;
                } else {
                    var prevLayout:Layout = View.get(previd).layout;
                    panel.layout.left = prevLayout.left + prevLayout.width;
                }
                if (offsetPosition) {
                    panel.layout.left += offsetPosition
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
        var dir:string = 'right';   // Default slide right
        if (id === this.listItems.last()) {
            dir = 'left';
        }
        this.updatePanelButtons();
        return dir;
    }

    insertAfter(prevPanel:PanelView, panel:PanelView, offsetPosition?:number):string {
        var id:string, previd:string;
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
            assert(this.value.obj[previd] === true,
                "insertAfter has unknown previous id");
        }
        this.value.insertAfter(panel.id, true, previd);
        return this.insertViewAfter(prevPanel, panel, offsetPosition);
    }

    append(panel:PanelView):string {
        return this.insertAfter(this.listItems.obj[this.listItems.last()], panel);
    }

    prepend(panel:PanelView):string {
        return this.insertAfter(null, panel);
    }

    getNewPanelSide(prefDir?:string):string {
        var isPanelToLeft:boolean = (this.listItems.first() !== this.value.first());
        var isPanelToRight:boolean = (this.listItems.last() !== this.value.last());
        if (!isPanelToLeft) { // must add panel from right, or do nothing
            return 'right';
        } else if (isPanelToLeft && !isPanelToRight) { // must add panel from left
            return 'left';
        } else {
            if (prefDir === 'left') {
                return 'left';
            }
            return 'right'; // default, keep leftPanel the same, add panel on right side
        }
    }

    fillPanel(prefDir:string, force?:boolean) { // shows a panel to left or right if missing
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
    }

    detach(panel:PanelView, slide?:string) { // detach from visible view
        if (panel instanceof PanelView) {
            var id:string = panel.id;
            var mid:string = panel.value.cid;
            var filler:string;
            var fPanel:PanelView = null;
            // remove panel from listItems-list
            // don't destroy it here, just detach it
            // but don't remove it from value here, it might just become invisible
            this.listItems.remove(panel.id);
        }
        if (panel.elem && panel.elem.parentNode) {
            panel.elem.parentNode.removeChild(panel.elem);
        }
    }

    showPrevLeft() {
        var leftPanel = this.listItems.obj[this.listItems.first()];
        var prev = this.value.prev[leftPanel.id];
        if (prev === '') {
            console.log("Not showing prev-left because nothing to show");
            return; // do nothing
        } else {
            var deadPanel:DeadPanel = <DeadPanel>DeadView.viewList[prev];
            assert(deadPanel instanceof DeadPanel, "Cannot find panel in graveyard");
            var newPanel:PanelView = deadPanel.resurrect();
            this.insertViewAfter(null, newPanel);
        }
    }

    showNextRight(positionOffset?:number) {
        var rightPanel = this.listItems.obj[this.listItems.last()];
        var next = this.value.next[rightPanel.id];
        if (next === '') {
            console.log("Not showing next-right because nothing to show");
            return; // do nothing
        } else {
            var deadPanel:DeadPanel = <DeadPanel>DeadView.viewList[next];
            assert(deadPanel instanceof DeadPanel, "Cannot find panel in graveyard");
            var newPanel:PanelView = deadPanel.resurrect();
            this.insertViewAfter(rightPanel, newPanel, positionOffset);
        }
    }

    updatePanelButtons() {
        var content = (<DiathinkView>View.getCurrentPage()).content;
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
            var i:string;
            for (i in this.listItems.obj) {
                (<PanelView>this.listItems.obj[i]).deletebutton.renderUpdate();
            }
        }
    }

    positionChildren(v:View,v2?:string,validate?:boolean) {
        this.itemWidth = Math.floor((this.parentView.layout.width-2) / this.numCols);
        var c:string = this.listItems.first();
        var w = 0;
        if (v != null) {
            w = v.layout.left + v.layout.width;
            c = this.listItems.next[v.id];
        }
        for (; c !== ''; c = this.listItems.next[c]) {
            var child:PanelView = <PanelView>this.listItems.obj[c];
            if (!child.layout) {child.layout = {};}
            if (child.layout.left !== w) {
                if (validate) {assert(false, "Panel has invalid left "+child.id);}
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
            this.gridRightLine.elem.style.left = w+'px';
        }
    }

    swipeStart(params:DragStartI) {
        this.swipeParams = {};
        this.swipeParams.start = params;
    }

    swipeMove(params:DragStartI) {
        // store last two moves for calculating release-speed in swipeStop
        if (!this.swipeParams.start) {return;}
        if (this.swipeParams.last) {
            this.swipeParams.prev = this.swipeParams.last;
        } else {
            this.swipeParams.prev = this.swipeParams.start;
        }
        this.swipeParams.last = params;
        var swipeDiff:number = this.getSwipeDiff(this.swipeParams.last, this.swipeParams.start);
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
    }

    getSwipeDiff(p1:DragStartI, p2:DragStartI):number {
        var oldx = p2.pos.left;
        var newx = p1.pos.left;
        return newx - oldx;
    }

    swipeStop(params:DragStartI) {
        // if no-swipe, remove hint of motion
        // otherwise start modified animation
        var speed = this.getSwipeDiff(this.swipeParams.last, this.swipeParams.prev);
        var dist = this.getSwipeDiff(this.swipeParams.last, this.swipeParams.start);
        if ((speed > 1) && (dist > 1)) { // right
            if (this.value.next[''] !== this.listItems.next['']) {
                ActionManager.simpleSchedule(View.focusedView, function() {
                    return {
                        actionType: SlidePanelsAction,
                        name: 'Swipe right',
                        direction: 'right',
                        speed: 80,
                        focus: false
                    }
                });
            }
        } else if ((speed < -1) && (dist < -1)) { // left
            if (this.value.prev[''] !== this.listItems.prev['']) {
                ActionManager.simpleSchedule(View.focusedView, function() {
                    return {
                        actionType: SlidePanelsAction,
                        name: 'Swipe left',
                        direction: 'left',
                        speed: 80,
                        focus: false
                    }
                });
            }
        } else {
            // restore location - animate this?
            this.layout.left = 0;
            this.elem.style.left = '0px';
        }
    }

    validate() {
        var p:string;
        super.validate();
        assert(this.listItems.count === _.size(PanelView.panelsById),
            "Wrong number of panels for grid-count");
        for (p = this.listItems.first(); p !== ''; p = this.listItems.next[p]) {
            assert(this.value.obj[p] === true,
                "Value does not match listItems panel " + p);
            if (this.listItems.next[p] !== '') {
                assert(this.value.next[p] === this.listItems.next[p],
                    "Value does not match listItems sequence panel " + p);
            }
        }
        for (p in this.value.obj) {
            assert(this.value.obj[p] === true,
                "Panel list value is not set to null" + p);
            if (this.listItems.obj[p] === undefined) {
                assert(DeadView.viewList[p] instanceof DeadPanel,
                    "Dead panel does not exist " + p);
            }
        }
        assert(this.listItems.count <= this.numCols, "Cannot have more panels than columns");
        if (this.listItems.count < this.numCols) {
           // assert(this.listItems.count===this.value.count,
           //     "Cannot have empty panel-slots when there are more to show");
        }
    }
}

