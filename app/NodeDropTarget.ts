///<reference path="actions/Action.ts"/>
class DropTarget {
    dockElem:HTMLElement;
    outlineID:string;
    oldOutlineID:string;
    animOptions:{
        startX?:number;
        startY?:number;
        endX?: number;
        endY?: number;
        startColor?:number[];
        endColor?:number[];
        startSize?:number;
        endSize?:number;
        startWidth?: number;
        view?:{[i:string]:{
            endNewHeight:number;
        }
        }
    } = {};
    constructor(opts) {}

    createUniquePlaceholder() {}
    getPlaceholder(i:string):HTMLElement {return null;}

    createViewPlaceholder(outline) {}

    setupPlaceholderAnim() {}

    placeholderAnimStep(frac:number) {}

    setupDockAnim(dockElem:HTMLElement) {}

    dockAnimStep(frac:number) {
        if (!this.dockElem) {return;}
        var endX = this.animOptions.endX, endY = this.animOptions.endY,
            startX = this.animOptions.startX, startY = this.animOptions.startY;
        var left = Math.round(frac * endX + (1 - frac) * startX);
        var top = Math.round(frac * endY + (1 - frac) * startY);
        var css:{
            left?:string;
            top?:string;
            width?:string;
            color?:string;
        };
        css = {
            left: left + 'px',
            top: top + 'px'
        };
        var o = this.animOptions;
        if ((this.outlineID===this.oldOutlineID)&&(left > startX)) {
            css.width = String(o.startWidth - (Number(left) - startX)) + 'px';
        }
        if (o.startColor && o.endColor) {
            var color = [Math.round((1 - frac) * o.startColor[0] + frac * o.endColor[0]),
                Math.round((1 - frac) * o.startColor[1] + frac * o.endColor[1]),
                Math.round((1 - frac) * o.startColor[2] + frac * o.endColor[2])];
            css.color = ['rgb(', color.join(','), ')'].join('');
        }
        if (o.startSize && o.endSize) {
            css['font-size'] = [Math.round((1 - frac) * o.startSize + frac * o.endSize), 'px'].join('');
        }
        $(this.dockElem).css(css);
    }

    setupDockFade() {}

    fadeAnimStep(frac:number) {}
    cleanup() {}
}
class NodeDropTarget extends DropTarget {
    createSpeed = 80;
    placeholderSpeed = 160;
    indentSpeed = 80;
    dockSpeed = 160;
    rNewModelContext:ModelContext;
    activeID:string;
    offsetUnderTop:number; // check for moving underneath existing element
    activeLineHeight:{[i:string]:number} = {}; // how much we are moving underneath
    rNewLinePlaceholder:{[i:string]:HTMLElement} = {};

    constructor(opts) {
        super(opts);
        this.rNewModelContext = opts.rNewModelContext;
        this.oldOutlineID = opts.outlineID;
        this.outlineID = opts.outlineID;
        this.activeID = opts.activeID;
        var o:string;
        var outlines = OutlineRootView.outlinesById;
        if (this.activeID != null) {
            for (o in outlines) {
                var activeView:NodeView = this.getNodeView(this.activeID, o);
                if (activeView!=null) {
                    this.activeLineHeight[o] = Math.round(activeView.elem.clientHeight);
                    console.log("Target: For view "+activeView.id+" got height "+this.activeLineHeight[o]);
                    if ((o === this.outlineID)&&(o === this.oldOutlineID)) {
                        this.offsetUnderTop = $(activeView.elem).offset().top;
                    }
                }
            }
        }
    }

    getNodeView(id, rootid):NodeView {
        var model = OutlineNodeModel.getById(id);
        if (!model) {
            model = OutlineNodeModel.deletedById[id];
        }
        if (model.views == null) {return null;}
        return model.views[rootid];
    }

    getPlaceholder(i:string) {
        return this.rNewLinePlaceholder[i];
    }

    contextParentVisible(context:ModelContext, outline):ListView {
        if (!context) {return null;}
        assert(context.parent != null, "context is null");
        var parent:NodeView = this.getNodeView(context.parent, outline.nodeRootView.id);
        if (parent != null) {
            return parent.children;
        } else { // parent is outside view, is it one level or more?
            if (OutlineNodeModel.getById(context.parent).get('children') ===
                View.get(outline.nodeRootView.id).value) {
                return outline.nodeRootView;
            } else { // context is out of scope
                return null;
            }
        }
    }

    createViewPlaceholder(outline) {
        // if (this.options.anim==='indent') {return;}
        if (!outline) {return;}
        var newModelContext = this.rNewModelContext;
        var parentView:ListView = this.contextParentVisible(newModelContext, outline);
        if (!parentView || parentView.hideList) {
            return;
        }
        var place = $('<li></li>').addClass('li-placeholder').css('height', 0);
        this.rNewLinePlaceholder[outline.id] = place.get(0);
        if (!newModelContext.prev) {
            place.addClass('ui-first-child');
        }
        if (!newModelContext.next) {
            place.addClass('ui-last-child');
        }
        if (newModelContext.next) {
            place.insertBefore('#' + this.getNodeView(newModelContext.next, outline.id).id);
        } else if (newModelContext.prev) {
            place.insertAfter('#' + this.getNodeView(newModelContext.prev, outline.id).id);
        } else if (newModelContext.parent) {
            place.appendTo('#' + parentView.id);
        }
    }

    setupPlaceholderAnim() {
        var o:string;
        var endNewHeight:number;
        var outlines = OutlineRootView.outlinesById;
        for (o in outlines) {
                if (this.rNewLinePlaceholder[o]) {
                    endNewHeight = this.activeLineHeight[o];
                    if (!endNewHeight) {
                        endNewHeight = Math.round(1.5 * Number($(document.body).css('font-size').replace(/px/, '')));
                    }
                    console.log("TargetePlaceholder outline "+o+" height "+endNewHeight);
                    if (this.animOptions.view === undefined) {
                        this.animOptions.view = {};
                    }
                    this.animOptions.view[o] = {
                        endNewHeight: endNewHeight
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
                var maxHeight = o.endNewHeight;
                $(this.rNewLinePlaceholder[i]).css('height',
                    String(maxHeight - Math.round(maxHeight * (1 - frac))) + 'px');
                console.log("Target going to "+maxHeight+" with fraction "+frac);
                console.log(String(maxHeight - Math.round(maxHeight * (1 - frac))) + 'px');
            }
        }
    }

    setupDockAnim(dockElem:HTMLElement) {
        this.dockElem = dockElem;
        // Is newLinePlace for this view above or below source?
        if ((this.rNewModelContext == null) || (!this.dockElem)) {
            return;
        }
        if (!this.rNewLinePlaceholder[this.outlineID]) { // nowhere to dock
            $(document.body).removeClass('transition-mode');
            this.dockElem.parentNode.removeChild(this.dockElem);
            this.dockElem = undefined;
            // console.log('Missing rNewLinePlaceholder in dockAnim');
            return;
        }
        var destination:{top:number;left:number} = $(this.rNewLinePlaceholder[this.outlineID]).offset();
        if (this.offsetUnderTop != null) {
            if (destination.top > this.offsetUnderTop) {
                destination.top -= this.activeLineHeight[this.outlineID];
            }
        }
        var startX = this.dockElem.offsetLeft;
        var startY = this.dockElem.offsetTop;
        var startWidth = this.dockElem.clientWidth;
        $(this.dockElem).addClass('ui-first-child').addClass('ui-last-child');
        // todo: inject speed and take max-duration?
        _.extend(this.animOptions, {
            startX: startX,
            startY: startY,
            endX: destination.left,
            endY: destination.top,
            startWidth: startWidth
        });
    }


    setupDockFade() {
    }

    fadeAnimStep() {
    }
    cleanup() {
        // do this after rNewLinePlaceholder has been replaced, so correct element is visible.
        var o:string;
        var outlines = OutlineRootView.outlinesById;
        for (o in outlines) {
            if (this.rNewLinePlaceholder[o]!=null) {
                if (this.rNewLinePlaceholder[o].parentNode) {
                    this.rNewLinePlaceholder[o].parentNode.removeChild(this.rNewLinePlaceholder[o]);
                }
                delete this.rNewLinePlaceholder[o];
                delete this.activeLineHeight[o];
            }
            // restore height if it was lost
            if (this.activeID) {
                var activeView:NodeView = this.getNodeView(this.activeID, o);
                if (activeView && activeView.elem) {
                    $(activeView.elem).css('height','').removeClass('drag-hidden');
                }
            }
        }
        if (this.dockElem) {
            $(document.body).removeClass('transition-mode');
            if (this.dockElem.parentNode) {
                this.dockElem.parentNode.removeChild(this.dockElem);
            }
            this.dockElem = undefined;
        }
    }
}