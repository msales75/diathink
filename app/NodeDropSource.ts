///<reference path="actions/Action.ts"/>
class DropSource {
    dockElem:HTMLElement;
    outlineID:string;
    animOptions:{
        startX?:number;
        startY?:number;
        endX?: number;
        endY?: number;
        startColor?:string;
        endColor?:string;
        startSize?:string;
        endSize?:string;
        startWidth?: number;
        view?:{[i:string]:{
            startOldHeight:number
        }
        }
    } = {};
    constructor(opts:{activeID:string;outlineID:string;}) {}
    getNodeView(id, rootid):NodeView {return null;}
    createUniquePlaceholder() {}
    createViewPlaceholder(outline) {}
    setupPlaceholderAnim() {}
    placeholderAnimStep(frac:number) {}
    createDockElem():HTMLElement {return null}
    getHelperParams() {}
    cleanup() {}
}

class NodeDropSource extends DropSource {
    deleteSpeed = 80;
    placeholderSpeed = 160;
    activeID:string;
    outlineID:string;
    activeLineHeight:{[i:string]:number} = {}; // how much we are moving underneath
    rOldLinePlaceholder:{[i:string]:HTMLElement} = {};

    constructor(opts:{activeID:string;outlineID:string;dockElem:HTMLElement}) { // more flags?
        super(opts);
        this.activeID = opts.activeID;
        this.outlineID = opts.outlineID;
        this.dockElem = opts.dockElem;
    }

    getNodeView(id, rootid):NodeView {
        var model = OutlineNodeModel.getById(id);
        if (!model) {
            model = OutlineNodeModel.deletedById[id];
        }
        if (model.views == null) {return null;}
        return model.views[rootid];
    }

    createViewPlaceholder(outline) {
        if (this.activeID==null) {return;}
        var activeLineView = this.getNodeView(this.activeID, outline.id);
        if (activeLineView == null) {
            return;
        }
        // vanish if not already hidden & shrink over 80ms
        if ($('#' + activeLineView.id).length === 0) {
            console.log('ERROR: activeLineView ' + activeLineView.id + ' exists but has not element for oldLinePlace');
            debugger;
        }

        var activeLineHeight = Math.round(activeLineView.elem.clientHeight);
        activeLineView.addClass('drag-hidden');
        this.activeLineHeight[outline.id] = activeLineHeight;
        console.log("Source: for view "+activeLineView.id+" got height "+this.activeLineHeight[outline.id]);
        var activeObj:JQuery = $(activeLineView.elem);

        console.log("Creating placeholder with css-height=" + activeLineHeight);
        var rOldLinePlaceholder = $('<li></li>').addClass('li-placeholder').css('height', String(activeLineHeight) + 'px');
        if (activeObj.hasClass('ui-first-child')) {
            rOldLinePlaceholder.addClass('ui-first-child');
        }
        if (activeObj.hasClass('ui-last-child')) {
            rOldLinePlaceholder.addClass('ui-last-child');
        }
        // if placeholder is present, old activeLineView-element must be removed.
        activeObj[0].parentNode.replaceChild(rOldLinePlaceholder[0], activeObj[0]);
        // activeObj is here removed from DOM, though still has a view.
        this.rOldLinePlaceholder[outline.nodeRootView.id] = rOldLinePlaceholder[0];
    }

    setupPlaceholderAnim() {
        var o:string;
        var startOldHeight:number;
        var outlines = OutlineRootView.outlinesById;
        for (o in outlines) {
            var placeholder:HTMLElement = this.rOldLinePlaceholder[o];
            if (placeholder) {
                startOldHeight = Math.round(this.activeLineHeight[o]);
                console.log("SourcePlaceholder outline "+o+" height "+startOldHeight);
                if (this.animOptions.view === undefined) {
                    this.animOptions.view = {};
                }
                this.animOptions.view[o] = {
                    startOldHeight: startOldHeight
                };
            }
        }
    }

    placeholderAnimStep(frac) {
        var outlines = OutlineRootView.outlinesById;
        var i:string;
        if (this.animOptions.view==null) {return;}
        for (i in outlines) {
            var o = this.animOptions.view[i];
            if (o != null) {
                var startOldHeight = o.startOldHeight;
                $(this.rOldLinePlaceholder[i]).css('height',
                    String(Math.round(startOldHeight * (1 - frac))) + 'px');
                console.log("Source starting from "+startOldHeight+" with fraction "+frac);
                console.log(String(Math.round(startOldHeight * (1 - frac))) + 'px');
            }
        }
    }

    createDockElem():HTMLElement {
        if (this.dockElem!=null) {
            return this.dockElem;
        }
        if (this.activeID==null) {return null;}
        var activeLineView = this.getNodeView(this.activeID, this.outlineID);
        if (!activeLineView) { // no find item to dock, e.g. undoing drag-into collapsed list
            return null;
        }
        if (! activeLineView.elem) {
            console.log('ERROR: activeLineView exists with missing element');
            debugger;
        }
        // if PanelRootAction, change the helper to be just the text instead of activeLineView
        // how do we know if 'source' is a panel?
        this.dockElem = <HTMLElement> activeLineView.elem.cloneNode(true);
        this.dockElem.id = '';
        var drawlayer:HTMLElement = View.getCurrentPage().drawlayer.elem;
        drawlayer.appendChild(this.dockElem);
        var offset = $(activeLineView.elem).offset();
        $(this.dockElem).css({
            position: 'absolute',
            left: offset.left + 'px',
            top: offset.top + 'px',
            width: activeLineView.elem.clientWidth,
            height: activeLineView.elem.clientHeight
        });
        $(document.body).addClass('transition-mode');
        return this.dockElem;
    }

    getHelperParams() {
    }
    cleanup() {
        var o:string;
        var outlines = OutlineRootView.outlinesById;
        for (o in outlines) {
            if (this.rOldLinePlaceholder[o]!=null) {
                if (this.rOldLinePlaceholder[o].parentNode) {
                    this.rOldLinePlaceholder[o].parentNode.removeChild(this.rOldLinePlaceholder[o]);
                }
                delete this.rOldLinePlaceholder[o];
            }
        }

    }
}