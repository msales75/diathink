///<reference path="Action.ts"/>

m_require("app/actions/Action.js");


class SlidePanelsAction extends Action {
    type='PanelSlide';
    oldLeftPanel:string=null;
    // options:ActionOptions= {direction:null};
    validateOptions() {
        var o:ActionOptions = this.options;
        var panels = View.currentPage.content.grid.listItems;
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
    execModel() {
        var that = this;
        this.addQueue('newModelAdd', ['context'], function() {
            var grid = View.getCurrentPage().content.grid;
            var o:ActionOptions = that.options;
            var dir;
            if (o.direction==='right') {
                if (o.undo) {
                    dir = 'left';
                } else {
                    dir = 'right';
                }
            } else if (o.direction==='left') {
                if (o.undo) {
                    dir = 'right';
                } else {
                    dir = 'left';
                }
            }
            if (dir==='right') {
                grid.slideRight();
            } else if (dir==='left') {
                grid.slideLeft();
            }
        });

    }
    execView(outline) {
        var that = this;
        this.addQueue(['view', outline.nodeRootView.id], ['newModelAdd', 'anim'], function() {
            var r= that.runtime;
        });
    }
}