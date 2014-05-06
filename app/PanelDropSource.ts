///<reference path="actions/Action.ts"/>
m_require("app/NodeDropSource.js");

class PanelDropSource extends DropSource {
    panelID:string;
    useFade:boolean;
    placeholderElem:HTMLElement;
    maxWidth:number;
    panelView:PanelView;
    slideDirection:string = 'right';
    containerWidth:number;
    constructor(opts) {
        super(opts);
        this.panelID = opts.panelID;
        this.useFade = opts.useFade;
    }
    createUniquePlaceholder() {
        if (this.useFade && this.panelID) { // fade it out, followed by width reduction
            this.panelView = <PanelView>View.get(this.panelID);
            var pos = $(this.panelView.elem).position();
            var height = $(this.panelView.elem).height();
            var el =$("<div></div>").css({
                opacity: 0,
                'z-index': 1,
                'background-color': '#CCC',
                position: 'absolute',
                top: pos.top+'px',
                left: pos.left+'px',
                width: this.panelView.parentView.itemWidth+'px',
                height: height+'px'
            });
            this.placeholderElem = el[0];
            this.panelView.elem.parentNode.appendChild(this.placeholderElem);
            this.maxWidth = this.panelView.parentView.itemWidth;
            this.containerWidth = this.panelView.parentView.itemWidth*this.panelView.parentView.numCols;
            var p:string;
            for (p in PanelView.panelsById) {
                // PanelView.panelsById[p].freezeWidth();
            }
            if (View.currentPage.content.gridwrapper.grid.listItems.first()===View.currentPage.content.gridwrapper.grid.value.first()) {
                this.slideDirection = 'left';
            } else {
                this.slideDirection = 'right';
            }
        }
    }
    setupPlaceholderAnim() {
    }
    placeholderAnimStep(frac:number) {
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
                $(this.panelView.elem).css({width: 0});
                this.panelView.elem.parentNode.insertBefore(this.placeholderElem, this.panelView.elem);
                if (this.slideDirection === 'right') {
                    $(this.panelView.elem.parentNode).css({
                        'margin-left': '-'+this.maxWidth+'px',
                        width: (this.containerWidth+this.maxWidth)+'px'
                    });
                } else {
                    $(this.panelView.elem.parentNode).css({
                        width: (this.containerWidth+this.maxWidth)+'px'
                    });
                }

                // increase width to left or right for new panel?, if panel goes to left,
                // we need to add a negative margin.
            }
        }
    }
    postAnimStep(frac:number) {
        if (this.placeholderElem) {
            var w:number = Math.round(this.maxWidth*(1-frac));
                $(this.placeholderElem).css({
                    opacity: 1,
                    width: String(w)+'px'
                });
                $(this.panelView.elem).css({
                    width: String(w)+'px'
                });
            if (this.slideDirection === 'right') {
                $(this.placeholderElem.parentNode).css({
                    'margin-left': '-'+String(w)+'px',
                    width: (this.containerWidth+w)+'px'
                });
            } else {
                $(this.placeholderElem.parentNode).css({
                    width: (this.containerWidth+w)+'px'
                });
            }
        }
    }
    createDockElem():View {
        return null;
    }
    getHelperParams() {

    }
    cleanup() {
        if (this.placeholderElem) {
            $(View.currentPage.content.gridwrapper.grid.elem).css({
                width: this.containerWidth+'px',
                'margin-left': '0'}
            );
            if (this.placeholderElem.parentNode) {
                this.placeholderElem.parentNode.removeChild(this.placeholderElem);
            }
            this.placeholderElem = null;
        }
    }
}