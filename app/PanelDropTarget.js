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
        this.placeholderElem = null;
        this.useFadeOut = opts.useFadeOut;
        this.activeID = opts.activeID;
        this.panelID = opts.panelID;
        this.prevPanel = opts.prevPanel;
        this.usePlaceholder = opts.usePlaceholder;
    }
    PanelDropTarget.prototype.getPlaceholder = function () {
        return this.placeholderElem;
    };
    PanelDropTarget.prototype.createUniquePlaceholder = function () {
        if (this.useFadeOut) {
            var fadeScreen = $("<div></div>");
            var panel = View.get(this.panelID);
            var elem = panel.outline.alist.elem;
            var offset = $(elem).offset();
            var height = elem.clientHeight;
            fadeScreen.addClass('ui-corner-all');
            fadeScreen.css({
                position: 'absolute',
                opacity: 0,
                'z-index': 1,
                width: panel.parentView.itemWidth + 'px',
                height: height,
                top: offset.top,
                left: offset.left,
                'background-color': '#CCC'
            }).appendTo(View.currentPage.content.gridwrapper.grid.elem);
            this.fadeScreen = fadeScreen[0];
        }

        if (this.usePlaceholder) {
            var grid = View.currentPage.content.gridwrapper.grid;
            var el = $("<div></div>").css({
                width: '0px',
                height: '100%'
            });
            this.placeholderElem = el[0];
            if (this.prevPanel) {
                if (grid.listItems.next[this.prevPanel] === '') {
                    grid.elem.appendChild(this.placeholderElem);
                } else {
                    grid.elem.insertBefore(this.placeholderElem, View.get(grid.listItems.next[this.prevPanel]).elem);
                }
            } else {
                grid.elem.insertBefore(this.placeholderElem, View.get(grid.listItems.first()).elem);
            }
        }
    };
    PanelDropTarget.prototype.setupPlaceholderAnim = function () {
        // freeze width of all panel elements
        if (this.usePlaceholder) {
            var p;
            for (p in PanelView.panelsById) {
                // PanelView.panelsById[p].freezeWidth();
            }
            this.slideDirection = 'right';
            if (this.prevPanel === View.currentPage.content.gridwrapper.grid.listItems.last()) {
                this.slideDirection = 'left';
            }
            this.maxWidth = View.currentPage.content.gridwrapper.grid.itemWidth;
            this.containerWidth = View.currentPage.content.gridwrapper.grid.numCols * this.maxWidth;
        }
    };
    PanelDropTarget.prototype.placeholderAnimStep = function (frac) {
        if (this.fadeScreen) {
            $(this.fadeScreen).css({
                opacity: frac
            });
        }
        if (this.usePlaceholder) {
            var w = Math.round(frac * this.maxWidth);
            $(this.placeholderElem).css('width', String(w) + 'px');
            if (this.slideDirection === 'left') {
                $(this.placeholderElem.parentNode).css({
                    width: String(this.containerWidth + w) + 'px',
                    'margin-left': '-' + w + 'px'
                });
            } else {
                $(this.placeholderElem.parentNode).css('width', String(this.containerWidth + w) + 'px');
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
        var bpos = $(oldBreadcrumbs.elem).position();

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
            width: (oldBreadcrumbs.elem.parentNode.clientWidth) + 'px'
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
        if (this.useFadeOut) {
            this.fadeScreen.parentNode.removeChild(this.fadeScreen);
        }
        if (this.usePlaceholder) {
            // normalize grid
            $(View.currentPage.content.gridwrapper.grid.elem).css({ width: '', 'margin-left': '' });
            if (this.placeholderElem.parentNode) {
                this.placeholderElem.parentNode.removeChild(this.placeholderElem);
            }
            this.placeholderElem = null;
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
