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
    nextView:PanelView;
    nextLeft:number;
    constructor(opts) {
        super(opts);
        this.panelID = opts.panelID;
        this.useFade = opts.useFade;
    }
    createUniquePlaceholder() {
        if (this.useFade && this.panelID) { // fade it out, followed by width reduction
            this.panelView = <PanelView>View.get(this.panelID);
            var pos = this.panelView.layout;
            var el =$("<div></div>").css({
                opacity: 0,
                'z-index': 1,
                'background-color': '#FFF',
                position: 'absolute',
                top: pos.top+'px',
                left: pos.left+'px',
                width: this.panelView.parentView.itemWidth+'px',
                height: pos.height+'px'
            });
            this.placeholderElem = el[0];
            this.panelView.elem.parentNode.appendChild(this.placeholderElem);
            this.maxWidth = this.panelView.parentView.itemWidth;
            this.containerWidth = this.panelView.parentView.itemWidth*this.panelView.parentView.numCols;
            //var p:string;
            //for (p in PanelView.panelsById) {
                // PanelView.panelsById[p].freezeWidth();
            //}
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
                /* $(this.placeholderElem).css({
                    position: 'static',
                    float: 'left'
                }); */
                $(this.panelView.elem).css({display: 'none'});
                $(this.placeholderElem).css({display:'none'});
                // this.panelView.elem.parentNode.insertBefore(this.placeholderElem, this.panelView.elem);
                var grid = this.panelView.parentView;
                if (this.slideDirection === 'right') {
                    grid.layout.left = -this.maxWidth;
                    grid.layout.width = this.containerWidth+this.maxWidth;
                    // move all children to the right +this.maxWidth
                    var firstPanel = <PanelView>View.get(this.panelView.parentView.listItems.first());
                    firstPanel.layout.left = this.maxWidth;
                    $(firstPanel.elem).css('left', firstPanel.layout.left+'px');
                    this.panelView.parentView.positionChildren(firstPanel); // fix all after first
                } else {
                    grid.layout.left = 0;
                    grid.layout.width = this.containerWidth+this.maxWidth;
                }
                grid.setPosition();
            }
        }
    }
    postAnimStep(frac:number) {
        if (this.placeholderElem) {
            var w:number = this.maxWidth - Math.round(this.maxWidth*frac);
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
            if (this.nextView!=null) {
                this.nextView.layout.left = this.nextLeft-Math.round(this.maxWidth*frac);
                $(this.nextView.elem).css('left', this.nextView.layout.left+'px');
                this.panelView.parentView.positionChildren(this.nextView);
            }

            if (this.slideDirection === 'right') {
                grid.layout.left = -w;
                grid.layout.width = this.containerWidth+w;
            } else {
                grid.layout.width = this.containerWidth+w;
            }
            grid.setPosition();
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
                left: 0});
            if (this.placeholderElem.parentNode) {
                this.placeholderElem.parentNode.removeChild(this.placeholderElem);
            }
            this.placeholderElem = null;
        }
    }
}