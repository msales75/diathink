///<reference path="View.ts"/>
m_require("app/views/GridView.js");
class PanelGridView extends GridView {
    cssClass = "scroll-container horizontal-grid";
    value:LinkedList<boolean>; // list of models for panels
    listItems:LinkedList<PanelView>; // list of rendered views based on models
    init() {
        this.Class = PanelGridView;
        this.listItemTemplate = PanelView;
        this.numCols = 2;
        this.listItems = new LinkedList<PanelView>();
        this.value = new LinkedList<boolean>();
        this.hideList = false;
    }

    updateValue() {
    }

    insertViewAfter(prevPanel:PanelView, panel:PanelView) {
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
            var nextPanel = this.listItems.next[id];
            if (!panel.elem) {panel.render();}
            if (nextPanel === '') {
                this.elem.appendChild(panel.elem);
            } else {
                this.elem.insertBefore(panel.elem, this.listItems.obj[nextPanel].elem);
            }
        }
        // Remove clipped panel and indicate animation-direction
        // decide whether we push-right or push-left
        // MUST slide right if there is no rightPanel
        // SHOULD slide left if it's put after last panel
        var dir:string = 'right';   // Default slide right
        if (this.listItems.count > this.numCols) {
            if (id === this.listItems.last()) {
                dir = 'left';
                var firstPanel:PanelView = <PanelView>this.listItems.obj[this.listItems.first()];
                firstPanel.destroy();
            } else {
                var lastPanel:PanelView = <PanelView>this.listItems.obj[this.listItems.last()];
                lastPanel.destroy();
            }
        }
        this.updatePanelButtons();
        this.updateWidths();
        return dir;
    }

    insertAfter(prevPanel:PanelView, panel:PanelView) {
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
        return this.insertViewAfter(prevPanel, panel);
    }

    append(panel:PanelView) {
        return this.insertAfter(this.listItems.obj[this.listItems.last()], panel);
    }

    prepend(panel:PanelView) {
        return this.insertAfter(null, panel);
    }

    detach(panel:PanelView, slide?:string) {
        var id:string = panel.id;
        var mid:string = panel.value.cid;
        var filler:string;
        var fPanel:PanelView = null;
        var isPanelToLeft:boolean = (this.listItems.first() !== this.value.first());
        var isPanelToRight:boolean = (this.listItems.last() !== this.value.last());
        var direction:string = 'left'; // default
        if (!isPanelToLeft) { // must slide left
            direction = 'left';
        } else if (isPanelToLeft && !isPanelToRight) { // must slide right
            direction = 'right';
        } else {
            if (slide === 'right') {
                direction = 'right';
            }
        }
        // remove panel from model-list
        // don't destroy it here, just detach it
        this.value.remove(id);
        this.listItems.remove(panel.id);

        if (direction==='left') {
            this.slideLeft();
        } else if (direction==='right') {
            this.slideRight();
        }
        return direction;
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

