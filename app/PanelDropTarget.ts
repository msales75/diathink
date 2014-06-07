///<reference path="actions/Action.ts"/>
m_require("app/NodeDropTarget.js");

class PanelDropTarget extends DropTarget {
    activeID:string;
    panelID:string;
    panelOffset:number;
    useFadeOut:boolean;
    fadeScreen:HTMLElement;
    usePlaceholder:boolean=false;
    //placeholderElem:HTMLElement = null;
    prevPanel:string;
    maxWidth:number;
    containerWidth:number;
    // slideDirection: string;
    nextView:PanelView;
    nextLeft:number;
    clipDir:string;

    constructor(opts) {
        super(opts);
        this.useFadeOut = opts.useFadeOut;
        this.activeID = opts.activeID;
        this.panelID = opts.panelID;
        this.prevPanel = opts.prevPanel;
        this.usePlaceholder = opts.usePlaceholder;
        this.clipDir = opts.clipDir;
        this.panelOffset = opts.panelOffset;
        if (!this.panelOffset) {this.panelOffset=0;}
    }
    //getPlaceholder() {
    //    return this.nextLeft;
    //}
    createUniquePlaceholder() {
        if (this.useFadeOut) { // a translucent screen over panel being replaced
            var panel:PanelView = (<PanelView>View.get(this.panelID));
            var fadeScreen = $('<div></div>').css({
                position: 'absolute',
                opacity: 0,
                'z-index': 1,
                width: panel.outline.layout.width+'px',
                height: panel.outline.layout.height+'px',
                top: (panel.layout.top+panel.outline.layout.top)+'px',
                left: (panel.layout.left+panel.outline.layout.left)+'px',
                'background-color': '#FFF'
            }).addClass('ui-corner-all').
                appendTo(View.currentPage.content.gridwrapper.grid.elem);
            this.fadeScreen = fadeScreen[0];
        }

        if (this.usePlaceholder) { // for inserted panel

            var grid = View.currentPage.content.gridwrapper.grid;
            //var el = $("<div></div>").css({
            //    width: '0px',
            //    height: grid.layout.height
            //});
            //this.placeholderElem = el[0];
            if (this.prevPanel) {
                if (grid.listItems.next[this.prevPanel]==='') { // last in list
                    this.nextView = null;
                    this.nextLeft = null;
                    // grid.elem.appendChild(this.placeholderElem);
                } else {
                    this.nextView = <PanelView>View.get(grid.listItems.next[this.prevPanel]);
                    // grid.elem.insertBefore(this.placeholderElem, this.nextView.elem);
                    this.nextLeft = this.nextView.layout.left;
                }
            } else { // insert at far left
                this.nextView = <PanelView>View.get(grid.listItems.first());
                this.nextLeft = this.nextView.layout.left;
                // grid.elem.insertBefore(this.placeholderElem, this.nextView.elem);
            }
        }
    }
    setupPlaceholderAnim() {
        var grid = View.currentPage.content.gridwrapper.grid;
        if (this.usePlaceholder) { // if creating panel, change width and grid-margin
        /*
            this.slideDirection = 'right';
            if (this.prevPanel === grid.listItems.last()) {
                if (grid.listItems.count===grid.numCols) {
                    this.slideDirection = 'left';
                } else {
                    this.slideDirection = 'none';
                }
            }
            */
            this.maxWidth = grid.itemWidth;
            this.containerWidth = grid.numCols*this.maxWidth+2;
        }
    }
    placeholderAnimStep(frac:number) {
        if (this.fadeScreen) {
            $(this.fadeScreen).css({
                opacity: frac
            });
        }
        if (this.usePlaceholder) {
            var grid=View.currentPage.content.gridwrapper.grid;
            var w:number = Math.round(frac*this.maxWidth);
            // $(this.placeholderElem).css('width',String(w)+'px');
            if (this.clipDir==='left') {
                grid.layout.width = this.containerWidth+w;
                grid.layout.left = -w;
                grid.setPosition();
            } else if (this.clipDir==='right') {
                grid.layout.width=this.containerWidth+w;
                grid.setPosition();
            }
            // adjust 'left' of panels to the right of insertion
            if (this.nextView!=null) {
                this.nextView.layout.left = this.nextLeft+w;
                $(this.nextView.elem).css('left', this.nextView.layout.left+'px');
                grid.positionChildren(this.nextView);
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
        var bpos = oldBreadcrumbs.layout;

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
            width: (oldBreadcrumbs.parentView.layout.width)+'px'
        }).insertAfter(oldBreadcrumbs.elem);
        panel.value = oldValue;
        // NOTE TO SELF: make sure lastElem is just one <a> and not the whole breadcrumb area,
        //   hence extra span at end of breadcrumbs.  Seems finicky.

        var clist = newBreadcrumbs.elem.children;
        var lastElem:HTMLElement = <HTMLElement>clist[clist.length-2];
        var textOff = $(lastElem).offset();
        var endWidth = lastElem.clientWidth;
        newBreadcrumbs.destroy();

        var startX = this.dockView.elem.offsetLeft;
        var startY = this.dockView.elem.offsetTop;
        var startWidth = this.dockView.elem.clientWidth;

        // find where the new breadcrumbs will be
        // fade the rest of the panel out
        // console.log("Setting up dock anim width from "+startWidth+" to "+startWidth);

        _.extend(this.animOptions, {
            startX: startX,
            startY: startY,
            endX: textOff.left+this.panelOffset,
            endY: textOff.top,
            startWidth: startWidth,
            endWidth: startWidth,
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

        var grid = View.currentPage.content.gridwrapper.grid;
        if (this.useFadeOut) {
            this.fadeScreen.parentNode.removeChild(this.fadeScreen);
        }
        if (this.usePlaceholder) {
            // normalize grid
            $(View.currentPage.content.gridwrapper.grid.elem).css({
                left: 0,
                width: String(grid.itemWidth*grid.numCols+2)+'px'
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
    }
}