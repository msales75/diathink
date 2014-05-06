///<reference path="View.ts"/>
m_require("app/views/GridView.js");
class PanelGridView extends GridView {
    cssClass = "scroll-container horizontal-grid";
    value:LinkedList<boolean>; // list of models for panels
    listItems:LinkedList<PanelView>; // list of rendered views based on models
    init() {
        this.listItemTemplate = PanelView;
        this.numCols = 2;
        this.listItems = new LinkedList<PanelView>();
        this.value = new LinkedList<boolean>();
        this.hideList = false;
    }

    updateValue() {
    }

    getInsertLocation(prevPanel:string):string {
        if (this.listItems.next[prevPanel]==='') {
            return prevPanel;
        } else {
            return this.listItems.next[prevPanel];
        }
    }

    insertViewAfter(prevPanel:PanelView, panel:PanelView, placeholder?:HTMLElement) {
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
            if (!panel.elem) {panel.render();}
            $(panel.elem).css('width', String(this.itemWidth)+'px');
            if (placeholder) {
                assert(placeholder.parentNode === this.elem, "Placeholder is not a child of of grid");
                this.elem.replaceChild(panel.elem, placeholder);
            } else {
                var nextPanel = this.listItems.next[id];
                if (nextPanel === '') {
                    this.elem.appendChild(panel.elem);
                } else {
                    this.elem.insertBefore(panel.elem, this.listItems.obj[nextPanel].elem);
                }
            }
            // fix width based on gridwrapper/numcols
        }
        var dir:string = 'right';   // Default slide right
        // Remove clipped panel and indicate animation-direction
        // decide whether we push-right or push-left
        // MUST slide right if there is no rightPanel
        // SHOULD slide left if it's put after last panel

        // don't remove extra-panel if its being animated.
        if (this.listItems.count > this.numCols) {
            if (id === this.listItems.last()) {
                dir = 'left';
                var firstPanel:PanelView = <PanelView>this.listItems.obj[this.listItems.first()];
                if (!firstPanel.animating) {
                    firstPanel.destroy();
                }
            } else {
                var lastPanel:PanelView = <PanelView>this.listItems.obj[this.listItems.last()];
                if (!lastPanel.animating) {
                    lastPanel.destroy();
                }
            }
        }
        this.updatePanelButtons();
        return dir;
    }

    insertAfter(prevPanel:PanelView, panel:PanelView, placeholder?:HTMLElement) {
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
        return this.insertViewAfter(prevPanel, panel, placeholder);
    }

    append(panel:PanelView) {
        return this.insertAfter(this.listItems.obj[this.listItems.last()], panel);
    }

    prepend(panel:PanelView) {
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
        /*
        if (direction==='right') {
            this.slideRight();
        } else if (direction==='left') {
            this.slideLeft();
        }
        */
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

    slideLeft() {
        var rightPanel = this.listItems.obj[this.listItems.last()];
        var next = this.value.next[rightPanel.id];
        if (next === '') {
            return; // do nothing
        } else {
            var deadPanel:DeadPanel = <DeadPanel>DeadView.viewList[next];
            assert(deadPanel instanceof DeadPanel, "Cannot find panel in graveyard");
            var newPanel:PanelView = deadPanel.resurrect();
            this.insertViewAfter(rightPanel, newPanel);
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

    /*
     redrawPanels(dir:string) {
     var p, n:number;
     var m:string;
     var children = this.listItems;
     if (dir === 'right') {
     for (m = children.first(); children.next[m] !== ''; m = children.next[m]) {
     this.redrawPanel(m, false);
     }
     }
     if (dir === 'left') {
     for (m = children.prev['']; children.prev[m] !== ''; m = children.prev[m]) {
     this.redrawPanel(m, false);
     }
     }
     }
     */
    /*
     redrawPanel(p, firsttime) {
     // should changeRoot it instead?
     var c; // save old panel context for undo
     if (p!=null) {
     c = this.listItems.obj[p].destroy();
     } else {
     c = {
     prev: null,
     next: null,
     parent: this.elem
     };
     }
     // create a new panel with right id, but wrong alist & breadcrumbs.
     var panel = new PanelView({
     id: p,
     parentView: this,
     rootModel: null
     });
     this.listItems.obj[p] = panel;
     panel.renderAt(c);
     }
     */
    /*
     moveAfter(id, previousid) { // currently unused
     if ((this.nextpanel[id] === undefined) || (this.prevpanel[id] === undefined) || (id === '')) {
     console.log('Error moving panel');
     debugger;
     return;
     }
     if ((this.nextpanel[previousid] === undefined) ||
     (this.prevpanel[previousid] === undefined)) {
     console.log('Error moving panel after previous-id'); // error
     debugger;
     return;
     }
     // remove id
     var next = this.nextpanel[id];
     var prev = this.prevpanel[id];
     this.nextpanel[prev] = next;
     this.prevpanel[next] = prev;
     // add-in after previousid
     var oldnext = this.nextpanel[previousid];
     this.nextpanel[previousid] = id;
     this.prevpanel[id] = previousid;
     this.nextpanel[id] = oldnext;
     this.prevpanel[oldnext] = id;
     }
     */
}

