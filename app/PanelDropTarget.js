var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="actions/Action.ts"/>
m_require("app/NodeDropTarget.js");

var PanelDropTarget = (function (_super) {
    __extends(PanelDropTarget, _super);
    function PanelDropTarget(opts) {
        _super.call(this, opts);
        this.usePlaceholder = false;
        this.useFadeOut = opts.useFadeOut;
        this.activeID = opts.activeID;
        this.panelID = opts.panelID;
        this.prevPanel = opts.prevPanel;
        this.usePlaceholder = opts.usePlaceholder;
    }
    //getPlaceholder() {
    //    return this.nextLeft;
    //}
    PanelDropTarget.prototype.createUniquePlaceholder = function () {
        if (this.useFadeOut) {
            var layout = View.get(this.panelID).outline.alist.layout;
            var fadeScreen = $('<div></div>').css({
                position: 'absolute',
                opacity: 0,
                'z-index': 1,
                width: layout.width + 'px',
                height: layout.height + 'px',
                top: layout.top + 'px',
                left: layout.left + 'px',
                'background-color': '#FFF'
            }).addClass('ui-corner-all').appendTo(View.currentPage.content.gridwrapper.grid.elem);
            this.fadeScreen = fadeScreen[0];
        }

        if (this.usePlaceholder) {
            var grid = View.currentPage.content.gridwrapper.grid;

            //var el = $("<div></div>").css({
            //    width: '0px',
            //    height: grid.layout.height
            //});
            //this.placeholderElem = el[0];
            if (this.prevPanel) {
                if (grid.listItems.next[this.prevPanel] === '') {
                    this.nextView = null;
                    this.nextLeft = null;
                    // grid.elem.appendChild(this.placeholderElem);
                } else {
                    this.nextView = View.get(grid.listItems.next[this.prevPanel]);

                    // grid.elem.insertBefore(this.placeholderElem, this.nextView.elem);
                    this.nextLeft = this.nextView.layout.left;
                }
            } else {
                this.nextView = View.get(grid.listItems.first());
                this.nextLeft = this.nextView.layout.left;
                // grid.elem.insertBefore(this.placeholderElem, this.nextView.elem);
            }
        }
    };
    PanelDropTarget.prototype.setupPlaceholderAnim = function () {
        var grid = View.currentPage.content.gridwrapper.grid;
        if (this.usePlaceholder) {
            this.slideDirection = 'right';
            if (this.prevPanel === grid.listItems.last()) {
                this.slideDirection = 'left';
            }
            this.maxWidth = grid.itemWidth;
            this.containerWidth = grid.numCols * this.maxWidth;
        }
    };
    PanelDropTarget.prototype.placeholderAnimStep = function (frac) {
        if (this.fadeScreen) {
            $(this.fadeScreen).css({
                opacity: frac
            });
        }
        if (this.usePlaceholder) {
            var grid = View.currentPage.content.gridwrapper.grid;
            var w = Math.round(frac * this.maxWidth);

            // $(this.placeholderElem).css('width',String(w)+'px');
            if (this.slideDirection === 'left') {
                grid.layout.width = this.containerWidth + w;
                grid.layout.left = -w;
            } else {
                grid.layout.width = this.containerWidth + w;
            }
            grid.setPosition();

            // adjust 'left' of panels to the right of insertion
            if (this.nextView != null) {
                this.nextView.layout.left = this.nextLeft + Math.round(this.maxWidth * frac);
                $(this.nextView.elem).css('left', this.nextView.layout.left + 'px');
                grid.positionChildren(this.nextView);
            }
        }
    };
    PanelDropTarget.prototype.setupDockAnim = function (dockView) {
        if (!dockView) {
            return;
        }
        this.dockView = dockView;

        // create the correct panel invisibly
        // we need to do the rest of this after the view is updated,
        //    but we need to keep the view from looking udpated.
        // todo: create empty/fictitious panel for animation positioning?
        if (!this.panelID) {
            debugger;
            return;
        }
        var panel = View.get(this.panelID);
        var oldBreadcrumbs = panel.breadcrumbs;
        var bpos = oldBreadcrumbs.layout;

        // change value of panel temporarily to render correct breadcrumbs
        var oldValue = panel.value;
        panel.value = OutlineNodeModel.getById(this.activeID);
        var newBreadcrumbs = new BreadcrumbView({
            parentView: panel
        });
        newBreadcrumbs.render();
        $(newBreadcrumbs.elem).css({
            opacity: 0,
            position: 'absolute',
            'z-index': 1,
            left: bpos.left,
            top: bpos.top,
            width: (oldBreadcrumbs.parentView.layout.width) + 'px'
        }).insertAfter(oldBreadcrumbs.elem);
        panel.value = oldValue;

        // NOTE TO SELF: make sure lastElem is just one <a> and not the whole breadcrumb area,
        //   hence extra span at end of breadcrumbs.  Seems finicky.
        var clist = newBreadcrumbs.elem.children;
        var lastElem = clist[clist.length - 2];
        var textOff = $(lastElem).offset();
        newBreadcrumbs.destroy();

        var startX = this.dockView.elem.offsetLeft;
        var startY = this.dockView.elem.offsetTop;
        var startWidth = this.dockView.elem.clientWidth;

        // find where the new breadcrumbs will be
        // fade the rest of the panel out
        _.extend(this.animOptions, {
            startX: startX,
            startY: startY,
            endX: textOff.left,
            endY: textOff.top,
            startWidth: startWidth,
            endWidth: lastElem.clientWidth,
            startSize: this.dockView.elem.style.fontSize,
            endSize: lastElem.style.fontSize
        });

        // other params to consider:
        var targetParams = {
            color: $(lastElem).css('color'),
            'font-size': $(lastElem).css('font-size'),
            'font-weight': $(lastElem).css('font-weight')
        };
    };
    PanelDropTarget.prototype.setupDockFade = function () {
    };
    PanelDropTarget.prototype.fadeAnimStep = function (frac) {
    };
    PanelDropTarget.prototype.cleanup = function () {
        var grid = View.currentPage.content.gridwrapper.grid;
        if (this.useFadeOut) {
            this.fadeScreen.parentNode.removeChild(this.fadeScreen);
        }
        if (this.usePlaceholder) {
            // normalize grid
            $(View.currentPage.content.gridwrapper.grid.elem).css({
                left: 0,
                width: String(grid.itemWidth * grid.numCols) + 'px'
            });
            //if (this.placeholderElem.parentNode) {
            //this.placeholderElem.parentNode.removeChild(this.placeholderElem);
            //}
            //this.placeholderElem = null;
        }
        if (this.dockView) {
            $(document.body).removeClass('transition-mode');
            this.dockView.destroy();
            this.dockView = undefined;
        }
    };
    return PanelDropTarget;
})(DropTarget);
//# sourceMappingURL=PanelDropTarget.js.map
