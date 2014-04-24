///<reference path="../app/views/View.ts"/>


$D.updatePanelButtons = function () {
    var content = (<DiathinkView>View.getCurrentPage()).content;
    var l = $('#' + content.leftbutton.id);
    var r = $('#' + content.rightbutton.id);
    var n, p;
    var allowleft = false, allowright = false;
    var PM = PanelManager;
    if (PM.leftPanel !== '') {
        if (PM.prevpanel[PM.leftPanel] !== '') {
            allowleft = true;
        }
        for (n = 1, p = PM.leftPanel; p !== ''; ++n, p = PM.nextpanel[p]) {
            if (n > PM.panelsPerScreen) {
                allowright = true;
                break;
            }
        }
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
};

$D.redrawPanels = function (dir) {
    var p, n;
    var PM = PanelManager;

    for (p = PM.leftPanel, n = 1;
        (p !== '') && (n <= PM.panelsPerScreen);
        ++n, p = PM.nextpanel[p]) {
        if (dir === 'right') {
            $D.redrawPanel(n, p, false);
        }
    }
    var n2 = n;
    for (; n2 <= PM.panelsPerScreen; ++n2) {
        $D.removePanel(n2);
    }
    if (dir === 'left') {
        --n;
        p = PM.prevpanel[p];
        for (;
            (p !== '') && (n >= 1);
            --n, p = PM.prevpanel[p]) {
            $D.redrawPanel(n, p, false);
        }
    }

    PM.updateRoots();
};

$D.redrawPanel = function (n, p, firsttime) {
    // should changeRoot it instead?
    var c;
    var PM = PanelManager;
    var grid = (<DiathinkView>View.currentPage).content.grid;
    if (grid['scroll' + String(n)]) {
        c = grid['scroll' + String(n)].destroy(); // save context for this
        // panel destroy() respects outline graveyard.
        grid['scroll' + String(n)] = null;
    } else {
        c = {
            prev: null,
            next: null,
            parent: $('#' + grid.id).children().get(n - 1)
        };
    }

    // create a new panel with right id, but wrong alist & breadcrumbs.
    grid['scroll' + String(n)] = new PanelView({
        id: p,
        parentView: grid,
        rootModel: null
    });
    grid['scroll' + String(n)].renderAt(c);

    // grid['scroll'+String(n)].theme();
    // grid['scroll'+String(n)].registerEvents();
    grid['scroll' + String(n)].changeRoot(
        PM.rootModels[p],
        PM.rootViews[p]
    );
};

$D.removePanel = function (n) {
    var grid = (<DiathinkView>View.getCurrentPage()).content.grid;
    grid['scroll' + String(n)].destroy();
    grid['scroll' + String(n)] = null;
};

class PanelManager {
    static nextpanel= {'': ''};
    static prevpanel= {'': ''};
    static rootViews= {};
    static rootModels= {};
    static count= 0;

    static leftPanel= '';
    static panelsPerScreen= 2;

    static deleted= {};
    static updateRoots() {
        var p=this.leftPanel;
        while ((p !== '')&&(View.get(p))) {
            this.rootViews[p] = (<PanelView>View.get(p)).outline.alist.id;
            this.rootModels[p] = (<PanelView>View.get(p)).value;
            p = this.nextpanel[p];
        }
    }
    static getRank(id) {
        var n, panel = this.nextpanel[''];
        for (n=1; panel !== ''; ++n) {
            if (panel === id) { return n; }
            panel = this.nextpanel[panel];
        }
        return -1;
    }
    static initFromDOM(grid) {
        this.insertAfter(grid.scroll2.id, '');
        this.insertAfter(grid.scroll1.id, '');
        this.updateRoots();

    }
    static insertAfter(newid, previousid) {
        if ((this.nextpanel[newid]!==undefined) ||
            (this.prevpanel[newid]!==undefined) || (newid === '')) {
            console.log('Error inserting invalid id'); // error
            debugger;
            return;
        }
        if ((this.nextpanel[previousid]===undefined)||
            (this.prevpanel[previousid]===undefined)) {
            console.log('Error inserting panel previous-id'); // error
            debugger;
            return;
        }

        var oldnext = this.nextpanel[previousid];
        this.nextpanel[previousid] = newid;
        this.prevpanel[newid] = previousid;
        this.nextpanel[newid] = oldnext;
        this.prevpanel[oldnext] = newid;
        ++this.count;
        if (this.deleted[newid]) {
            delete this.deleted[newid];
        }

        // Update leftPanel if necessary
        // decide whether we push-right or push-left
        // MUST slide right if there is no rightPanel
        // SHOULD slide left if it's put after last panel
        // Default slide right
        if (this.count===1) { // first panel
            this.leftPanel = newid;
            return 'right';
        }
        var leftOffset = this.getRank(this.leftPanel);
        var newOffset = this.getRank(newid);
        if ((leftOffset<1)||(newOffset<1)) {
            console.log("leftOffset or newOffset not defined for insert");
            debugger;
        }
        if (newOffset < leftOffset) {
            this.leftPanel = newid;
            return 'right'; // push panels to right
        } else if (newOffset >= leftOffset + this.panelsPerScreen) { // last panel on screen
            this.leftPanel = this.nextpanel[this.leftPanel];
            return 'left'; // push panels to left
        } else {
            return 'right'; // push right with no change to leftPanel
        }
    }
    static remove(id, slide?) {
        if ((this.nextpanel[id]===undefined) || (this.prevpanel[id]===undefined) || (id==='')) {
            console.log('Error removing panel');
            debugger;
            return;
        }

        // Update leftPanel after removal
        var offset = this.getRank(this.leftPanel)-1;
        var isPanelToLeft = !(this.prevpanel[this.leftPanel]==='');
        var isPanelToRight = (this.count - offset > this.panelsPerScreen);
        var direction:string = 'left'; // default
        if (!isPanelToLeft) { // must slide left
            direction = 'left';
        } else if (isPanelToLeft && !isPanelToRight) { // must slide right
            direction = 'right';
        } else {
            if (slide==='right') {
                direction='right';
            }
        }

        if (this.leftPanel === id) { // if leftPanel is being removed
            if (direction==='left') {
                this.leftPanel = this.nextpanel[this.leftPanel];
            } else {
                this.leftPanel = this.prevpanel[this.leftPanel];
            }
        } else {
            if (direction==='left') {
                // leftPanel is unchanged.
            } else if (direction==='right') {
                this.leftPanel = this.prevpanel[this.leftPanel];
            }
        }

        var next = this.nextpanel[id];
        var prev = this.prevpanel[id];
        --this.count;
        this.nextpanel[prev] = next;
        this.prevpanel[next] = prev;
        delete this.nextpanel[id];
        delete this.prevpanel[id];
        this.deleted[id] = id;
        return direction;
    }
    static moveAfter(id, previousid) { // currently unused
        if ((this.nextpanel[id]===undefined) || (this.prevpanel[id]===undefined) || (id==='')) {
            console.log('Error moving panel');
            debugger;
            return;
        }
        if ((this.nextpanel[previousid]===undefined)||
            (this.prevpanel[previousid]===undefined)) {
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
}
