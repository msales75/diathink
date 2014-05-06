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
        this.listItemTemplate = PanelView;
        this.numCols = 2;
        this.listItems = new LinkedList();
        this.value = new LinkedList();
        this.hideList = false;
    };

    PanelGridView.prototype.updateValue = function () {
    };

    PanelGridView.prototype.getInsertLocation = function (prevPanel) {
        if (this.listItems.next[prevPanel] === '') {
            return prevPanel;
        } else {
            return this.listItems.next[prevPanel];
        }
    };

    PanelGridView.prototype.insertViewAfter = function (prevPanel, panel, placeholder) {
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
                panel.render();
            }
            $(panel.elem).css('width', String(this.itemWidth) + 'px');
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
        var dir = 'right';

        // Remove clipped panel and indicate animation-direction
        // decide whether we push-right or push-left
        // MUST slide right if there is no rightPanel
        // SHOULD slide left if it's put after last panel
        // don't remove extra-panel if its being animated.
        if (this.listItems.count > this.numCols) {
            if (id === this.listItems.last()) {
                dir = 'left';
                var firstPanel = this.listItems.obj[this.listItems.first()];
                if (!firstPanel.animating) {
                    firstPanel.destroy();
                }
            } else {
                var lastPanel = this.listItems.obj[this.listItems.last()];
                if (!lastPanel.animating) {
                    lastPanel.destroy();
                }
            }
        }
        this.updatePanelButtons();
        return dir;
    };

    PanelGridView.prototype.insertAfter = function (prevPanel, panel, placeholder) {
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
            }
        } else {
            previd = prevPanel.id;
            assert(this.value.obj[previd] === true, "insertAfter has unknown previous id");
        }
        this.value.insertAfter(panel.id, true, previd);
        return this.insertViewAfter(prevPanel, panel, placeholder);
    };

    PanelGridView.prototype.append = function (panel) {
        return this.insertAfter(this.listItems.obj[this.listItems.last()], panel);
    };

    PanelGridView.prototype.prepend = function (panel) {
        return this.insertAfter(null, panel);
    };
    PanelGridView.prototype.getSlideDirection = function (slide) {
        var isPanelToLeft = (this.listItems.first() !== this.value.first());
        var isPanelToRight = (this.listItems.last() !== this.value.last());
        if (!isPanelToLeft) {
            return 'left';
        } else if (isPanelToLeft && !isPanelToRight) {
            return 'right';
        } else {
            if (slide === 'right') {
                return 'right';
            }
            return 'left';
        }
    };

    PanelGridView.prototype.slideFill = function (slide) {
        var direction = this.getSlideDirection();
        if (direction === 'left') {
            this.slideLeft();
        } else if (direction === 'right') {
            this.slideRight();
        }
        return direction;
    };

    PanelGridView.prototype.detach = function (panel, slide) {
        var id = panel.id;
        var mid = panel.value.cid;
        var filler;
        var fPanel = null;

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
    };

    PanelGridView.prototype.slideRight = function () {
        var leftPanel = this.listItems.obj[this.listItems.first()];
        var prev = this.value.prev[leftPanel.id];
        if (prev === '') {
            return;
        } else {
            var deadPanel = DeadView.viewList[prev];
            assert(deadPanel instanceof DeadPanel, "Cannot find panel in graveyard");
            var newPanel = deadPanel.resurrect();
            this.insertViewAfter(null, newPanel);
        }
    };

    PanelGridView.prototype.slideLeft = function () {
        var rightPanel = this.listItems.obj[this.listItems.last()];
        var next = this.value.next[rightPanel.id];
        if (next === '') {
            return;
        } else {
            var deadPanel = DeadView.viewList[next];
            assert(deadPanel instanceof DeadPanel, "Cannot find panel in graveyard");
            var newPanel = deadPanel.resurrect();
            this.insertViewAfter(rightPanel, newPanel);
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
    };
    return PanelGridView;
})(GridView);
//# sourceMappingURL=PanelGridView.js.map
