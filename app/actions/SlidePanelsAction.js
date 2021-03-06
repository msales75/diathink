var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="Action.ts"/>
m_require("app/actions/Action.js");
var SlidePanelsAction = (function (_super) {
    __extends(SlidePanelsAction, _super);
    function SlidePanelsAction() {
        _super.apply(this, arguments);
        this.type = 'PanelSlide';
        this.oldLeftPanel = null;
        this.newLeftPanel = null;
        this.usePostAnim = true;
    }
    // options:ActionOptions= {direction:null};
    SlidePanelsAction.prototype.validateOptions = function () {
        var o = this.options;
        var panels = View.currentPage.content.gridwrapper.grid.listItems;
        if (!o.redo && !o.undo) {
            this.oldLeftPanel = panels.first();
        }
        if (o.redo) {
            if (this.oldLeftPanel !== panels.first()) {
                console.log("leftPanel isi wrong before redo slide");
                debugger;
            }
        } else if (o.undo) {
            assert(this.newLeftPanel === panels.first(), "Left panel is wrong before undo slide");
        }
    };
    SlidePanelsAction.prototype.validateNewContext = function () {
        var o = this.options;
        var panels = View.currentPage.content.gridwrapper.grid.listItems;
        if (!o.redo && !o.undo) {
            this.newLeftPanel = panels.first();
        } else if (o.undo) {
            assert(panels.first() === this.oldLeftPanel, "In Slide, leftpanel wrong after undo");
        } else if (o.redo) {
            assert(panels.first() === this.newLeftPanel, "In Slide, leftpanel wrong after undo");
        }
    };

    SlidePanelsAction.prototype.getDirection = function () {
        var o = this.options;
        if (o.direction === 'right') {
            if (o.undo) {
                return 'left';
            } else {
                return 'right';
            }
        } else if (o.direction === 'left') {
            if (o.undo) {
                return 'right';
            } else {
                return 'left';
            }
        }
        return null;
    };

    SlidePanelsAction.prototype.animSetup = function () {
        var that = this;
        this.addQueue(['anim'], [
            ['context']
        ], function () {
            var grid = View.getCurrentPage().content.gridwrapper.grid;
            that.startLeft = grid.layout.left;

            // console.log("Starting slide animation with startLeft = "+that.startLeft);
            grid.layout.width = grid.itemWidth * (grid.numCols + 1) + 2;
            if (that.getDirection() === 'right') {
                grid.layout.left = that.startLeft - grid.itemWidth; // OK

                // console.log("Anim-right setup modifies left = "+grid.layout.left);
                grid.setPosition();
                var firstPanel = View.get(grid.listItems.first());
                firstPanel.layout.left = grid.itemWidth;
                firstPanel.setPosition();
                grid.positionChildren(firstPanel);

                // protect right panel from deletion
                grid.listItems.obj[grid.listItems.last()].animating = true;
            } else {
                grid.setPosition();
                grid.listItems.obj[grid.listItems.first()].animating = true;
            }
        });
    };

    SlidePanelsAction.prototype.execUniqueView = function () {
        var that = this;
        this.addQueue(['uniqueView'], [
            ['context'],
            ['anim']
        ], function () {
            var grid = View.getCurrentPage().content.gridwrapper.grid;
            var o = that.options;
            var dir;
            if (o.direction === 'right') {
                if (o.undo) {
                    dir = 'left';
                } else {
                    dir = 'right';
                }
            } else if (o.direction === 'left') {
                if (o.undo) {
                    dir = 'right';
                } else {
                    dir = 'left';
                }
            }
            if (dir === 'right') {
                console.log("In SlidePanels showing PrevLeft panel");
                grid.showPrevLeft(); // adds panel to left
            } else if (dir === 'left') {
                console.log("In SlidePanels showing NextRight panel");
                grid.showNextRight();
            }
        });
    };

    SlidePanelsAction.prototype.anim2Step = function (frac) {
        var grid = View.getCurrentPage().content.gridwrapper.grid;
        if (this.getDirection() === 'right') {
            var w = grid.itemWidth - this.startLeft - Math.round(frac * (grid.itemWidth - this.startLeft));
            grid.layout.left = -w;

            // console.log("Anim-right step setting left to "+grid.layout.left);
            $(grid.elem).css({
                left: '-' + String(w) + 'px'
            });
            if (frac === 1) {
                assert(grid.listItems.obj[grid.listItems.last()].animating, "");
                if (grid.listItems.count > grid.numCols) {
                    console.log("In SlidePanels, clipping rightmost panel");
                    grid.clipPanel('right');
                } else {
                }
                grid.updatePanelButtons();
            }
        } else {
            var w = -this.startLeft + Math.round(frac * (grid.itemWidth + this.startLeft));
            grid.layout.left = -w;

            // console.log("Anim-left step setting left to "+grid.layout.left);
            $(grid.elem).css({
                left: '-' + String(w) + 'px'
            });
            if (frac === 1) {
                assert(grid.listItems.obj[grid.listItems.first()].animating, "");
                console.log("In SlidePanels, clipping leftmost panel");
                grid.clipPanel('left');
                grid.updatePanelButtons();
            }
        }
    };
    return SlidePanelsAction;
})(AnimatedAction);
//# sourceMappingURL=SlidePanelsAction.js.map
