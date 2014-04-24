///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/actions/Action.js");

var SlidePanelsAction = (function (_super) {
    __extends(SlidePanelsAction, _super);
    function SlidePanelsAction() {
        _super.apply(this, arguments);
        this.type = 'PanelSlide';
        this.oldLeftPanel = null;
    }
    // options:ActionOptions= {direction:null};
    SlidePanelsAction.prototype.validateOptions = function () {
        var o = this.options;
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
    };
    SlidePanelsAction.prototype.execModel = function () {
        var that = this;
        this.addQueue('newModelAdd', ['context'], function () {
            var grid = View.getCurrentPage().content.grid;
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
                grid.slideRight();
            } else if (dir === 'left') {
                grid.slideLeft();
            }
        });
    };
    SlidePanelsAction.prototype.execView = function (outline) {
        var that = this;
        this.addQueue(['view', outline.nodeRootView.id], ['newModelAdd', 'anim'], function () {
            var r = that.runtime;
        });
    };
    return SlidePanelsAction;
})(Action);
//# sourceMappingURL=SlidePanelsAction.js.map
