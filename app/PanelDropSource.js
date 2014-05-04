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
        this.slideDirection = 'right';
        this.panelID = opts.panelID;
        this.useFade = opts.useFade;
    }
    PanelDropSource.prototype.createUniquePlaceholder = function () {
        if (this.useFade && this.panelID) {
            this.panelView = View.get(this.panelID);
            var pos = $(this.panelView.elem).position();
            var height = $(this.panelView.elem).height();
            var width = $(this.panelView.elem).width();
            var el = $("<div></div>").css({
                opacity: 0,
                'z-index': 1,
                'background-color': '#CCC',
                position: 'absolute',
                top: pos.top + 'px',
                left: pos.left + 'px',
                width: width + 'px',
                height: height + 'px'
            });
            this.placeholderElem = el[0];
            this.panelView.elem.parentNode.appendChild(this.placeholderElem);
            this.maxWidth = this.panelView.elem.clientWidth;
            this.containerWidth = View.currentPage.content.gridwrapper.elem.clientWidth;
            var p;
            for (p in PanelView.panelsById) {
                PanelView.panelsById[p].freezeWidth();
            }
            if (View.currentPage.content.gridwrapper.grid.listItems.first() === View.currentPage.content.gridwrapper.grid.value.first()) {
                this.slideDirection = 'left';
            } else {
                this.slideDirection = 'right';
            }
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
                $(this.placeholderElem).css({
                    position: 'static',
                    float: 'left'
                });
                $(this.panelView.elem).css({ width: 0 });
                this.panelView.elem.parentNode.insertBefore(this.placeholderElem, this.panelView.elem);
                if (this.slideDirection === 'right') {
                    $(this.panelView.elem.parentNode).css({
                        'margin-left': '-' + this.maxWidth + 'px',
                        width: (this.containerWidth + this.maxWidth) + 'px'
                    });
                } else {
                    $(this.panelView.elem.parentNode).css({
                        width: (this.containerWidth + this.maxWidth) + 'px'
                    });
                }
                // increase width to left or right for new panel?, if panel goes to left,
                // we need to add a negative margin.
            }
        }
    };
    PanelDropSource.prototype.postAnimStep = function (frac) {
        if (this.placeholderElem) {
            var w = Math.round(this.maxWidth * (1 - frac));
            $(this.placeholderElem).css({
                opacity: 1,
                width: String(w) + 'px'
            });
            $(this.panelView.elem).css({
                width: String(w) + 'px'
            });
            if (this.slideDirection === 'right') {
                $(this.placeholderElem.parentNode).css({
                    'margin-left': '-' + String(w) + 'px',
                    width: (this.containerWidth + w) + 'px'
                });
            } else {
                $(this.placeholderElem.parentNode).css({
                    width: (this.containerWidth + w) + 'px'
                });
            }
        }
    };
    PanelDropSource.prototype.createDockElem = function () {
        return null;
    };
    PanelDropSource.prototype.getHelperParams = function () {
    };
    PanelDropSource.prototype.cleanup = function () {
        if (this.placeholderElem) {
            $(View.currentPage.content.gridwrapper.grid.elem).css({ width: '', 'margin-left': '' });
            if (this.placeholderElem.parentNode) {
                this.placeholderElem.parentNode.removeChild(this.placeholderElem);
            }
            this.placeholderElem = null;
        }
    };
    return PanelDropSource;
})(DropSource);
//# sourceMappingURL=PanelDropSource.js.map
