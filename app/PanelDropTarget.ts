///<reference path="actions/Action.ts"/>
m_require("app/NodeDropTarget.js");

class PanelDropTarget extends DropTarget {
    activeID:string;
    panelID:string;
    useFadeOut:boolean;
    fadeScreen:HTMLElement;
    usePlaceholder:boolean=false;
    placeholderElem:HTMLElement = null;
    prevPanel:string;
    maxWidth:number;
    containerWidth:number;
    slideDirection: string;

    constructor(opts) {
        super(opts);
        this.useFadeOut = opts.useFadeOut;
        this.activeID = opts.activeID;
        this.panelID = opts.panelID;
        this.prevPanel = opts.prevPanel;
        this.usePlaceholder = opts.usePlaceholder;
    }
    getPlaceholder() {
        return this.placeholderElem;
    }
    createUniquePlaceholder() {
        if (this.useFadeOut) { // a translucent screen over panel being replaced
            var fadeScreen:JQuery = $("<div></div>");
            var elem:HTMLElement = (<PanelView>View.get(this.panelID)).outline.alist.elem;
            var offset= $(elem).offset();
            var width:number = elem.clientWidth;
            var height:number = elem.clientHeight;
            fadeScreen.addClass('ui-corner-all');
            fadeScreen.css({
                position: 'absolute',
                opacity: 0,
                'z-index': 1,
                width: width,
                height: height,
                top: offset.top,
                left: offset.left,
                'background-color': '#CCC'
            }).appendTo(View.currentPage.content.gridwrapper.grid.elem);
            this.fadeScreen = fadeScreen[0];
        }

        if (this.usePlaceholder) { // for inserted panel

            var grid = View.currentPage.content.gridwrapper.grid;
            var el = $("<div></div>").css({
                width: '0px',
                height: '100%'
            });
            this.placeholderElem = el[0];
            if (this.prevPanel) {
                if (grid.listItems.next[this.prevPanel]==='') { // last in list
                    grid.elem.appendChild(this.placeholderElem);
                } else {
                    grid.elem.insertBefore(this.placeholderElem, View.get(grid.listItems.next[this.prevPanel]).elem);
                }
            } else { // insert at far left
                grid.elem.insertBefore(this.placeholderElem, View.get(grid.listItems.first()).elem);
            }
        }
    }
    setupPlaceholderAnim() {
        // freeze width of all panel elements

        if (this.usePlaceholder) { // if creating panel, change width and grid-margin
            var p:string;
            for (p in PanelView.panelsById) {
                PanelView.panelsById[p].freezeWidth();
            }
            this.slideDirection = 'right';
            if (this.prevPanel === View.currentPage.content.gridwrapper.grid.listItems.last()) {
                this.slideDirection = 'left';
            }
            this.maxWidth = View.get(View.currentPage.content.gridwrapper.grid.listItems.first()).elem.clientWidth;
            this.containerWidth = View.currentPage.content.gridwrapper.elem.clientWidth;
        }
    }
    placeholderAnimStep(frac:number) {
        if (this.fadeScreen) {
            $(this.fadeScreen).css({
                opacity: frac
            });
        }
        if (this.usePlaceholder) {
            var w:number = Math.round(frac*this.maxWidth);
            $(this.placeholderElem).css('width',String(w)+'px');
            if (this.slideDirection==='left') {
                $(this.placeholderElem.parentNode).css({
                    width: String(this.containerWidth+w)+'px',
                    'margin-left': '-'+w+'px'
                });
            } else {
                $(this.placeholderElem.parentNode).css('width', String(this.containerWidth+w)+'px');
            }
        }
    }
    setupDockAnim(dockView:View) {
        if (!dockView) {return;}
        this.dockView = dockView;
        // create the correct panel invisibly
        // we need to do the rest of this after the view is updated,
        //    but we need to keep the view from looking udpated.

        // todo: create empty/fictitious panel for animation positioning?
        if (!this.panelID) {
            debugger;
            return;
        }
        var panel:PanelView = <PanelView>View.get(this.panelID);
        var oldBreadcrumbs = panel.breadcrumbs;
        var bpos = $(oldBreadcrumbs.elem).position();

        // change value of panel temporarily to render correct breadcrumbs
        var oldValue = panel.value;
        panel.value = OutlineNodeModel.getById(this.activeID);
        var newBreadcrumbs = new BreadcrumbView({
            parentView:panel
        });
        newBreadcrumbs.render();
        $(newBreadcrumbs.elem).css({
            opacity: 0,
            position: 'absolute',
            'z-index': 1,
            left: bpos.left,
            top: bpos.top,
            width: ((<HTMLElement>oldBreadcrumbs.elem.parentNode).clientWidth)+'px'
        }).insertAfter(oldBreadcrumbs.elem);
        panel.value = oldValue;
        // NOTE TO SELF: make sure lastElem is just one <a> and not the whole breadcrumb area,
        //   hence extra span at end of breadcrumbs.  Seems finicky.

        var clist = newBreadcrumbs.elem.children;
        var lastElem:HTMLElement = <HTMLElement>clist[clist.length-2];
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
    }
    setupDockFade() {

    }
    fadeAnimStep(frac:number) {

    }
    cleanup() {

        if (this.useFadeOut) {
            this.fadeScreen.parentNode.removeChild(this.fadeScreen);
        }
        if (this.usePlaceholder) {
            // normalize grid
            $(View.currentPage.content.gridwrapper.grid.elem).css({width: '', 'margin-left': ''});
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
    }
}