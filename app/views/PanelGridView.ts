///<reference path="View.ts"/>
m_require("app/views/GridView.js");
class PanelGridView extends View {
    parentView:GridContainerView;
    cssClass = "scroll-container horizontal-grid";
    value:LinkedList<boolean>; // list of models for panels
    listItems:LinkedList<PanelView>; // list of rendered views based on models
    numCols:number;
    itemWidth:number;
    init() {
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
        this.insertListItems();
        this.setPosition();
        return this.elem;
    }
    updateCols() {
        var width = View.currentPage.layout.width;
        var oldNumCols = this.numCols;
        var id:string;
        if (width<250) {
            this.numCols = 1;
        } else if (width < 1300) {
            this.numCols = 2;
        } else {
            this.numCols = 3;
        }
        if (oldNumCols !== this.numCols) {
            if (this.value && (this.value.count>0)) {
                if (oldNumCols>this.numCols) {
                    this.clip('right');
                } else if (oldNumCols<this.numCols) {
                    this.slideFill('left');
                }
            }
        }
    }

    updateValue() {
    }
    layoutDown() {
        var p:Layout = this.parentView.layout;
        // when not expanded for more hidden panels
        this.layout = {
            top: 0,
            height:p.height,
            left: 0, // not always
            width: p.width // not always
        };
    }
    getInsertLocation(prevPanel:string):string {
        if (this.listItems.next[prevPanel]==='') {
            return prevPanel;
        } else {
            return this.listItems.next[prevPanel];
        }
    }
    clip(dir:string) {
        if (this.listItems.count > this.numCols) {
            if (dir==='left') {
                var firstPanel:PanelView = <PanelView>this.listItems.obj[this.listItems.first()];
                    firstPanel.destroy();
            } else if (dir==='right') {
                var lastPanel:PanelView = <PanelView>this.listItems.obj[this.listItems.last()];
                    lastPanel.destroy();
            }
        }
        this.layout.left = 0;
        this.layout.width = this.numCols * this.itemWidth;
        this.positionChildren(null);
        this.setPosition();
    }

    insertViewAfter(prevPanel:PanelView, panel:PanelView, leftPosition?:number):string {
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
                if (previd==='') {// insert to far left
                    panel.layout.left = 0;
                } else {
                    var prevLayout:Layout = View.get(previd).layout;
                    panel.layout.left = prevLayout.left+prevLayout.width;
                }
                if (leftPosition) {
                    panel.layout.left += leftPosition
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

    insertAfter(prevPanel:PanelView, panel:PanelView, leftPosition?:number):string {
        var id:string, previd:string;
        assert(panel !== null, "No panel given to insert");
        id = panel.id;
        assert(this.value.next[id] === undefined, "panel is already in list");
        if (prevPanel == null) {
            if (this.value.count===0) {
                previd = '';
            } else {
                assert(this.listItems.count>0, "value is non-empty but listItems are empty");
                previd = this.value.prev[this.listItems.first()];
            }
        } else {
            previd = prevPanel.id;
            assert(this.value.obj[previd]===true,
                "insertAfter has unknown previous id");
        }
        this.value.insertAfter(panel.id, true, previd);
        return this.insertViewAfter(prevPanel, panel, leftPosition);
    }

    append(panel:PanelView):string {
        return this.insertAfter(this.listItems.obj[this.listItems.last()], panel);
    }

    prepend(panel:PanelView):string {
        return this.insertAfter(null, panel);
    }
    getSlideDirection(slide?:string):string {
        var isPanelToLeft:boolean = (this.listItems.first() !== this.value.first());
        var isPanelToRight:boolean = (this.listItems.last() !== this.value.last());
        if (!isPanelToLeft) { // must slide left
            return 'left';
        } else if (isPanelToLeft && !isPanelToRight) { // must slide right
            return 'right';
        } else {
            if (slide === 'right') {
                return 'right';
            }
            return 'left'; // default
        }
    }

    slideFill(slide:string) {
        var direction = this.getSlideDirection();
        if (direction==='left') {
            this.slideLeft();
        } else if (direction==='right') {
            this.slideRight();
        }
        return direction;
    }

    detach(panel:PanelView, slide?:string) {
        var id:string = panel.id;
        var mid:string = panel.value.cid;
        var filler:string;
        var fPanel:PanelView = null;
        // remove panel from model-list
        // don't destroy it here, just detach it
        this.listItems.remove(panel.id);

        if (panel.elem && panel.elem.parentNode) {
            panel.elem.parentNode.removeChild(panel.elem);
        }
    }

    slideRight() {
        var leftPanel = this.listItems.obj[this.listItems.first()];
        var prev = this.value.prev[leftPanel.id];
        if (prev === '') {
            return; // do nothing
        } else {
            var deadPanel:DeadPanel = <DeadPanel>DeadView.viewList[prev];
            assert(deadPanel instanceof DeadPanel, "Cannot find panel in graveyard");
            var newPanel:PanelView = deadPanel.resurrect();
            this.insertViewAfter(null, newPanel);
        }
    }

    slideLeft(leftPosition?:number) {
        var rightPanel = this.listItems.obj[this.listItems.last()];
        var next = this.value.next[rightPanel.id];
        if (next === '') {
            return; // do nothing
        } else {
            var deadPanel:DeadPanel = <DeadPanel>DeadView.viewList[next];
            assert(deadPanel instanceof DeadPanel, "Cannot find panel in graveyard");
            var newPanel:PanelView = deadPanel.resurrect();
            this.insertViewAfter(rightPanel, newPanel, leftPosition);
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
    }
    positionChildren(v:View) {
        this.itemWidth = Math.floor(this.parentView.layout.width/this.numCols);
        var c:string = this.listItems.first();
        var w = 0;
        if (v!=null) {
            w = v.layout.left + v.layout.width;
            c = this.listItems.next[v.id];
        }
        for ( ; c!==''; c = this.listItems.next[c]) {
            var child:PanelView = <PanelView>this.listItems.obj[c];
            if (!child.layout) {child.layout= {};}
            if (child.layout.left!==w) {
                child.layout.left = w;
                if (child.elem) {
                    $(child.elem).css('left', w+'px');
                }
            }
            w += child.layout.width;
        }
    }

    validate() {
        var p:string;
        super.validate();
        assert(this.listItems.count === _.size(PanelView.panelsById),
            "Wrong number of panels for grid-count");
        for (p = this.listItems.first(); p !== ''; p = this.listItems.next[p]) {
            assert(this.value.obj[p]=== true,
                "Value does not match listItems panel "+p);
            if (this.listItems.next[p]!=='') {
                assert(this.value.next[p]===this.listItems.next[p],
                "Value does not match listItems sequence panel "+p);
            }
        }
        for (p in this.value.obj) {
            assert(this.value.obj[p]===true,
                "Panel list value is not set to null"+p);
            if (this.listItems.obj[p] === undefined) {
                assert(DeadView.viewList[p] instanceof DeadPanel,
                    "Dead panel does not exist "+p);
            }
        }
    }
}

