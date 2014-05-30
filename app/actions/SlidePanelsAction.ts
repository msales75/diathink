///<reference path="Action.ts"/>
m_require("app/actions/Action.js");
class SlidePanelsAction extends AnimatedAction {
    type = 'PanelSlide';
    oldLeftPanel:string = null;
    startLeft:number;
    usePostAnim = true;
    // options:ActionOptions= {direction:null};
    validateOptions() {
        var o:ActionOptions = this.options;
        var panels = View.currentPage.content.gridwrapper.grid.listItems;
        if (!o.redo && !o.undo) {
            this.oldLeftPanel = panels.first();
        }
        if (o.redo) {
            if (this.oldLeftPanel !== panels.first()) {
                console.log("leftPanel doesn't match");
                debugger;
            }
        }
    }

    getDirection():string {
        var o:ActionOptions = this.options;
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
    }

    animSetup() {
        var that = this;
        this.addQueue(['anim'], [
            ['context']
        ], function() {
            var grid = View.getCurrentPage().content.gridwrapper.grid;
            that.startLeft = grid.layout.left;
            console.log("Starting slide animation with startLeft = "+that.startLeft);
            if (that.getDirection() === 'right') { // increase grid-width and margin-left
                grid.layout.width = grid.itemWidth * (grid.numCols + 1);
                grid.layout.left = that.startLeft-grid.itemWidth; // OK
                console.log("Anim-right setup modifies left = "+grid.layout.left);
                grid.setPosition();
                var firstPanel = View.get(grid.listItems.first());
                firstPanel.layout.left = grid.itemWidth;
                firstPanel.setPosition();
                grid.positionChildren(firstPanel);

                // protect right panel from deletion
                (<PanelView>grid.listItems.obj[grid.listItems.last()]).animating = true;
            } else { // increase grid-width only
                grid.layout.width = grid.itemWidth * (grid.numCols + 1);
                grid.setPosition();
                (<PanelView>grid.listItems.obj[grid.listItems.first()]).animating = true;
            }
        });
    }

    execUniqueView() {
        var that = this;
        this.addQueue(['uniqueView'], [
            ['context'],
            ['anim']
        ], function() {
            var grid = View.getCurrentPage().content.gridwrapper.grid;
            var o:ActionOptions = that.options;
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
                grid.slideRight(); // adds panel to left
            } else if (dir === 'left') {
                grid.slideLeft();
            }
        });
    }

    anim2Step(frac:number) {
        var grid = View.getCurrentPage().content.gridwrapper.grid;
        if (this.getDirection() === 'right') {
            var w = grid.itemWidth-this.startLeft -
                Math.round(frac*(grid.itemWidth-this.startLeft));
            grid.layout.left = -w;
            console.log("Anim-right step setting left to "+grid.layout.left);
            $(grid.elem).css({
                left: '-'+String(w)+'px'
            });
            if (frac === 1) { // cleanup rightmost panel
                assert((<PanelView>grid.listItems.obj[grid.listItems.last()]).animating, "");
                grid.clip('right');
                grid.updatePanelButtons();
            }
        } else {
            var w = -this.startLeft + Math.round(frac*(grid.itemWidth+this.startLeft));
            grid.layout.left = -w;
            console.log("Anim-left step setting left to "+grid.layout.left);
            $(grid.elem).css({
                left: '-'+String(w)+'px'
            });
            if (frac === 1) { // cleanup left panels
                assert((<PanelView>grid.listItems.obj[grid.listItems.first()]).animating, "");
                grid.clip('left');
                grid.updatePanelButtons();
            }
        }
    }
}