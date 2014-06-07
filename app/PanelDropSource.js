var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="actions/Action.ts"/>
m_require("app/NodeDropSource.js");

var PanelDropSource = (function (_super) {
    __extends(PanelDropSource, _super);
    function PanelDropSource(opts) {
        _super.call(this, opts);
        this.panelID = opts.panelID;
        this.useFade = opts.useFade;
        this.fillDir = opts.fillDir;
    }
    PanelDropSource.prototype.createUniquePlaceholder = function () {
        if (this.useFade && this.panelID) {
            this.panelView = View.get(this.panelID);
            var pos = this.panelView.layout;
            var el = $("<div></div>").css({
                opacity: 0,
                'z-index': 1,
                'background-color': '#FFF',
                position: 'absolute',
                top: pos.top + 'px',
                left: pos.left + 'px',
                width: this.panelView.parentView.itemWidth + 'px',
                height: pos.height + 'px'
            });
            this.placeholderElem = el[0];
            this.panelView.elem.parentNode.appendChild(this.placeholderElem);
            this.maxWidth = this.panelView.parentView.itemWidth;
            this.containerWidth = this.panelView.parentView.itemWidth * this.panelView.parentView.numCols + 2;
            //var p:string;
            //for (p in PanelView.panelsById) {
            // PanelView.panelsById[p].freezeWidth();
            //}
            /*
            var grid = View.currentPage.content.gridwrapper.grid;
            if ((grid.listItems.last()===grid.value.last())&&
            (grid.listItems.count>grid.numCols)) {
            this.slideDirection = 'right';
            } else {
            this.slideDirection = 'left';
            } */
        }
    };
    PanelDropSource.prototype.setupPlaceholderAnim = function () {
    };
    PanelDropSource.prototype.placeholderAnimStep = function (frac) {
        if (this.placeholderElem) {
            $(this.placeholderElem).css({
                opacity: frac
            });
            if (frac === 1) {
                // replace panel with placeholder, but leave hidden element for PanelGridView to remove
                /* $(this.placeholderElem).css({
                position: 'static',
                float: 'left'
                }); */
                $(this.panelView.elem).css({ display: 'none' });
                $(this.placeholderElem).css({ display: 'none' });

                // this.panelView.elem.parentNode.insertBefore(this.placeholderElem, this.panelView.elem);
                var grid = this.panelView.parentView;
                if (this.fillDir === 'left') {
                    grid.layout.left = -this.maxWidth;
                    grid.layout.width = this.containerWidth + this.maxWidth;

                    // move all children to the right +this.maxWidth
                    var firstPanel = View.get(this.panelView.parentView.listItems.first());
                    firstPanel.layout.left = this.maxWidth;
                    $(firstPanel.elem).css('left', firstPanel.layout.left + 'px');
                    this.panelView.parentView.positionChildren(firstPanel); // fix all after first
                } else if (this.fillDir === 'right') {
                    grid.layout.left = 0;
                    grid.layout.width = this.containerWidth + this.maxWidth;
                } else {
                    grid.layout.left = 0;
                    grid.layout.width = this.containerWidth;
                }
                grid.setPosition();
            }
        }
    };
    PanelDropSource.prototype.postAnimStep = function (frac) {
        if (this.placeholderElem) {
            var w = this.maxWidth - Math.round(this.maxWidth * frac);
            var grid = this.panelView.parentView;

            // need to put new object to the right of the placeholder
            /*
            $(this.placeholderElem).css({
            opacity: 1,
            width: String(w)+'px'
            });
            $(this.panelView.elem).css({
            width: String(w)+'px'
            });
            */
            if (this.nextView != null) {
                this.nextView.layout.left = this.nextLeft - Math.round(this.maxWidth * frac);
                $(this.nextView.elem).css('left', this.nextView.layout.left + 'px');
                this.panelView.parentView.positionChildren(this.nextView);
            } else {
                this.panelView.parentView.positionChildren(View.get(this.panelView.parentView.listItems.last()));
            }

            if (this.fillDir === 'left') {
                grid.layout.left = -w;
                grid.layout.width = this.containerWidth + w;
            } else if (this.fillDir === 'right') {
                grid.layout.width = this.containerWidth + w;
            }
            grid.setPosition();
        }
    };
    PanelDropSource.prototype.createDockElem = function () {
        return null;
    };
    PanelDropSource.prototype.getHelperParams = function () {
    };
    PanelDropSource.prototype.cleanup = function () {
        if (this.placeholderElem) {
            var grid = this.panelView.parentView;
            grid.layout.width = this.containerWidth;
            grid.layout.left = 0;
            $(View.currentPage.content.gridwrapper.grid.elem).css({
                width: this.containerWidth + 'px',
                left: 0 });
            if (this.placeholderElem.parentNode) {
                this.placeholderElem.parentNode.removeChild(this.placeholderElem);
            }
            this.placeholderElem = null;
        }
    };
    return PanelDropSource;
})(DropSource);
//# sourceMappingURL=PanelDropSource.js.map
