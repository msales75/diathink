///<reference path="Action.ts"/>

m_require("app/animations/AnimatedAction.js");

class DockAnimAction extends AnimatedAction {
    indentSpeed= 80;
    dockSpeed= 160;
    oldModelContext; // these are tested for existence
    newModelContext;
/*
    getObjectParams(obj, textobj) {
// * Currently unused, precisely orients text in object-boundaries
        // if old-type = new-type, don't need to deal with this
        var oldParams = {};
        oldParams.elem = oldObject;
        var offset = $(oldObject).offset();
        oldParams.top = offset.top;
        oldParams.left = offset.left;
        var textoffset = $(textobj).offset();
        oldParams.textTop = textoffset.top - offset.top;
        oldParams.textLeft = textoffset.left - offset.left;
        oldParams.fontSize = Number($(textobj).css('font-size').replace(/px/,''));
        oldParams.textWidth = $(textobj).width();
        oldParams.textHeight = $(textobj).height();
        oldParams.color = $(textobj).css('color');
        return oldParams;
    } */
    dockAnimStep(frac, o) {
        var endX= o.endX, endY= o.endY,
            startX = o.startX, startY = o.startY;

        var left = String(Math.round(frac*endX+(1-frac)*startX));
        var top = String(Math.round(frac*endY+(1-frac)*startY));
        var css:{
            left?:string;
            top?:string;
            width?:string;
            color?:string;
        };
        css = {
            left: left+'px',
            top: top+'px'
        };
        if ((this.options.anim==='indent')&&(left > startX)) {
            css.width = String(o.startWidth-(left-startX))+'px';
        }
        if (o.startColor && o.endColor) {
            var color = [Math.round((1-frac)*o.startColor[0]+ frac*o.endColor[0]),
                Math.round((1-frac)*o.startColor[1]+ frac*o.endColor[1]),
                Math.round((1-frac)*o.startColor[2]+ frac*o.endColor[2])];
            css.color = ['rgb(',color.join(','),')'].join('');
        }
        if (o.startSize && o.endSize) {
            css['font-size'] = [Math.round((1-frac)*o.startSize+frac*o.endSize),'px'].join('');
        }
        $(this.options.dockElem).css(css);
    }
    animFadeEnv() {
        var r = this.runtime;
        if (this.oldType!==this.newType) {
            if (this.oldType==='line') { // get rid of borders & handle

            } else if (this.oldType==='panel') { // get rid of breadcrumb-stuff?

            }
        }
    }

    createDockElem() {
        var r = this.runtime;
        if (r.createDockElem) {
            // create virtual $D.helper for animation
            // is start-location a line or panel

            // if (r.rOldType === 'panel')

            var oldRoot = r.rOldRoot;
            var activeLineView = this.getLineView(this.options.activeID, oldRoot);
            if (!activeLineView) { // no find item to dock, e.g. undoing drag-into collapsed list
                return;
            }
            if ($('#'+activeLineView.id).length===0) {
                console.log('ERROR: activeLineView exists with missing element');
                debugger;
            }

            // if PanelRootAction, change the helper to be just the text instead of activeLineView
            // how do we know if 'source' is a panel?
            this.options.dockElem = <HTMLElement> $('#'+activeLineView.id)[0].cloneNode(true);
            this.options.dockElem.id = '';
            var drawlayer = $('#'+View.getCurrentPage().drawlayer.id);
            drawlayer[0].appendChild(this.options.dockElem);
            var offset = $('#'+activeLineView.id).offset();
            $(this.options.dockElem).css({
                position: 'absolute',
                left: offset.left+'px',
                top: offset.top+'px',
                width: $('#'+activeLineView.id)[0].clientWidth,
                height: $('#'+activeLineView.id)[0].clientHeight
            });
            $(document.body).addClass('transition-mode');
        }
    }

    // this seems the same for PanelRootAction panel-docking
    // todo: for non-docking, start fade-in after restoreContext before focus
    // dock the dragged-helper
    dockAnim(newRoot) {
        var r = this.runtime;
        console.log('In dockAnim now');
        if (r.performDock) {
            // Is newLinePlace for this view above or below source?
            if ((this.newModelContext == null)||(this.oldModelContext == null)) {
                console.log("ERROR: docking attempted with null context");
                debugger;
            }
            if (! r.rNewLinePlaceholder[newRoot]) { // nowhere to dock
                $(document.body).removeClass('transition-mode');
                this.options.dockElem.parentNode.removeChild(this.options.dockElem);
                this.options.dockElem = undefined;
                console.log('Missing rNewLinePlaceholder in dockAnim');
                return;
            }
            if (!this.options.dockElem) { // nothing to dock
                console.log('Missing dockElem in dockAnim');
                return;
            }
            var speed;
            if (this.options.anim==='dock') {speed = this.dockSpeed;}
            else if (this.options.anim==='indent') {speed = this.indentSpeed;}
            var startX = this.options.dockElem.offsetLeft;
            var startY = this.options.dockElem.offsetTop;
            var startWidth = this.options.dockElem.clientWidth;

            var destination = $(r.rNewLinePlaceholder[newRoot]).offset();
            if (r.rOldLinePlaceholder[newRoot]) {
                var oldOffset = $(r.rOldLinePlaceholder[newRoot]).offset();
                if (destination.top > oldOffset.top) {destination.top -= r.activeLineHeight[newRoot];}
            }
            $(this.options.dockElem).addClass('ui-first-child').addClass('ui-last-child');

            // todo: inject speed and take max-duration?
            console.log('Extending animOptions NOW');
            _.extend(r.animOptions, {
                dock: true,
                startX: startX,
                startY: startY,
                endX: destination.left,
                endY: destination.top,
                startWidth: startWidth
            });
        }
    }
}

