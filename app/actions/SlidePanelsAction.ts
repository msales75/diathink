///<reference path="Action.ts"/>

m_require("app/actions/Action.js");


class SlidePanelsAction extends Action {
    type='PanelSlide';
    oldLeftPanel=null;
    // options:ActionOptions= {direction:null};
    execModel() {
        var that = this;
        this.addQueue('newModelAdd', ['context'], function() {
            var PM:typeof PanelManager;
            PM = PanelManager;
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
                PM.leftPanel = PM.prevpanel[PM.leftPanel];
                $D.redrawPanels('right');
            } else if (dir==='left') {
                PM.leftPanel = PM.nextpanel[PM.leftPanel];
                $D.redrawPanels('left');
            }
            $D.updatePanelButtons();
        });

    }
    execView(outline) {
        var that = this;
        this.addQueue(['view', outline.nodeRootView.id], ['newModelAdd', 'anim'], function() {
            var r= that.runtime;
        });
    }
}