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
                console.log("leftPanel doesn't match");
                debugger;
            }
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
            if (that.getDirection() === 'right') {
                $(grid.elem).css({
                    width: String(grid.itemWidth * (grid.numCols + 1)) + 'px',
                    'margin-left': '-' + String(grid.itemWidth) + 'px'
                });

                // protect right panel from deletion
                grid.listItems.obj[grid.listItems.last()].animating = true;
            } else {
                $(grid.elem).css({
                    width: String(grid.itemWidth * (grid.numCols + 1)) + 'px'
                });
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
                grid.slideRight();
            } else if (dir === 'left') {
                grid.slideLeft();
            }
            $(window).resize(); // fix links in panel; a bit hacky
        });
    };

    SlidePanelsAction.prototype.anim2Step = function (frac) {
        var grid = View.getCurrentPage().content.gridwrapper.grid;
        if (this.getDirection() === 'right') {
            var w = Math.round((1 - frac) * grid.itemWidth);
            $(grid.elem).css({
                'margin-left': '-' + String(w) + 'px'
            });
            if (frac === 1) {
                assert(grid.listItems.obj[grid.listItems.last()].animating, "");
                $(grid.elem).css({ 'margin-left': '', width: '' });
                grid.listItems.obj[grid.listItems.last()].elem.style.display = 'none';
                grid.listItems.obj[grid.listItems.last()].destroy();
                grid.updatePanelButtons();
            }
        } else {
            var w = Math.round(frac * grid.itemWidth);
            $(grid.elem).css({
                'margin-left': '-' + String(w) + 'px'
            });
            if (frac === 1) {
                assert(grid.listItems.obj[grid.listItems.first()].animating, "");
                $(grid.elem).css({ 'margin-left': '', width: '' });
                grid.listItems.obj[grid.listItems.first()].elem.style.display = 'none';
                grid.listItems.obj[grid.listItems.first()].destroy();
                grid.updatePanelButtons();
            }
        }
    };
    return SlidePanelsAction;
})(AnimatedAction);
//# sourceMappingURL=SlidePanelsAction.js.map
