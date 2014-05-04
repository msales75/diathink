///<reference path="Action.ts"/>
m_require("app/actions/Action.js");
class SlidePanelsAction extends AnimatedAction {
    type = 'PanelSlide';
    oldLeftPanel:string = null;
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
            if (that.getDirection() === 'right') { // increase grid-width and margin-left
                $(grid.elem).css({
                    width: String(grid.itemWidth * (grid.numCols + 1)) + 'px',
                    'margin-left': '-' + String(grid.itemWidth) + 'px'
                });
                // protect right panel from deletion
                (<PanelView>grid.listItems.obj[grid.listItems.last()]).animating = true;
            } else { // increase grid-width only
                $(grid.elem).css({
                    width: String(grid.itemWidth * (grid.numCols + 1)) + 'px'
                });
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
                grid.slideRight();
            } else if (dir === 'left') {
                grid.slideLeft();
            }
        });
    }

    anim2Step(frac:number) {
        var grid = View.getCurrentPage().content.gridwrapper.grid;
        if (this.getDirection() === 'right') {
            var w = Math.round((1-frac)*grid.itemWidth);
            $(grid.elem).css({
                'margin-left': '-'+String(w)+'px'
            });
            if (frac === 1) { // cleanup rightmost panel
                assert((<PanelView>grid.listItems.obj[grid.listItems.last()]).animating, "");
                $(grid.elem).css({'margin-left': '', width: ''});
                (<PanelView>grid.listItems.obj[grid.listItems.last()]).elem.style.display='none';
                (<PanelView>grid.listItems.obj[grid.listItems.last()]).destroy();
                grid.updatePanelButtons();
            }
        } else {
            var w = Math.round(frac*grid.itemWidth);
            $(grid.elem).css({
                'margin-left': '-'+String(w)+'px'
            });
            if (frac === 1) { // cleanup left panels
                assert((<PanelView>grid.listItems.obj[grid.listItems.first()]).animating, "");
                $(grid.elem).css({'margin-left': '', width: ''});
                (<PanelView>grid.listItems.obj[grid.listItems.first()]).elem.style.display='none';
                (<PanelView>grid.listItems.obj[grid.listItems.first()]).destroy();
                grid.updatePanelButtons();
            }
        }
    }
}