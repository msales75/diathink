///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/actions/AnimatedAction.js");

var DockAnimAction = (function (_super) {
    __extends(DockAnimAction, _super);
    function DockAnimAction() {
        _super.apply(this, arguments);
        this.indentSpeed = 80;
        this.dockSpeed = 160;
    }
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
    DockAnimAction.prototype.dockAnimStep = function (frac, o) {
        var endX = o.endX, endY = o.endY, startX = o.startX, startY = o.startY;

        var left = String(Math.round(frac * endX + (1 - frac) * startX));
        var top = String(Math.round(frac * endY + (1 - frac) * startY));
        var css;
        css = {
            left: left + 'px',
            top: top + 'px'
        };
        if ((this.options.anim === 'indent') && (left > startX)) {
            css.width = String(o.startWidth - (Number(left) - startX)) + 'px';
        }
        if (o.startColor && o.endColor) {
            var color = [
                Math.round((1 - frac) * o.startColor[0] + frac * o.endColor[0]),
                Math.round((1 - frac) * o.startColor[1] + frac * o.endColor[1]),
                Math.round((1 - frac) * o.startColor[2] + frac * o.endColor[2])];
            css.color = ['rgb(', color.join(','), ')'].join('');
        }
        if (o.startSize && o.endSize) {
            css['font-size'] = [Math.round((1 - frac) * o.startSize + frac * o.endSize), 'px'].join('');
        }
        $(this.options.dockElem).css(css);
    };
    DockAnimAction.prototype.animFadeEnv = function () {
        var r = this.runtime;
        if (this.oldType !== this.newType) {
            if (this.oldType === 'line') {
            } else if (this.oldType === 'panel') {
            }
        }
    };

    DockAnimAction.prototype.createDockElem = function () {
        var r = this.runtime;
        if (r.createDockElem) {
            // create virtual $D.helper for animation
            // is start-location a line or panel
            // if (r.rOldType === 'panel')
            var oldRoot = r.rOldRoot;
            var activeLineView = this.getNodeView(this.options.activeID, oldRoot);
            if (!activeLineView) {
                return;
            }
            if ($('#' + activeLineView.id).length === 0) {
                console.log('ERROR: activeLineView exists with missing element');
                debugger;
            }

            // if PanelRootAction, change the helper to be just the text instead of activeLineView
            // how do we know if 'source' is a panel?
            this.options.dockElem = $('#' + activeLineView.id)[0].cloneNode(true);
            this.options.dockElem.id = '';
            var drawlayer = $('#' + View.getCurrentPage().drawlayer.id);
            drawlayer[0].appendChild(this.options.dockElem);
            var offset = $('#' + activeLineView.id).offset();
            $(this.options.dockElem).css({
                position: 'absolute',
                left: offset.left + 'px',
                top: offset.top + 'px',
                width: $('#' + activeLineView.id)[0].clientWidth,
                height: $('#' + activeLineView.id)[0].clientHeight
            });
            $(document.body).addClass('transition-mode');
        }
    };

    // this seems the same for PanelRootAction panel-docking
    // todo: for non-docking, start fade-in after restoreContext before focus
    // dock the dragged-helper
    DockAnimAction.prototype.dockAnim = function (newRoot) {
        var r = this.runtime;
        console.log('In dockAnim now');
        if (r.performDock) {
            // Is newLinePlace for this view above or below source?
            if ((this.newModelContext == null) || (this.oldModelContext == null)) {
                console.log("ERROR: docking attempted with null context");
                debugger;
            }
            if (!r.rUseNewLinePlaceholder[newRoot]) {
                $(document.body).removeClass('transition-mode');
                this.options.dockElem.parentNode.removeChild(this.options.dockElem);
                this.options.dockElem = undefined;
                console.log('Missing rNewLinePlaceholder in dockAnim');
                return;
            }
            if (!this.options.dockElem) {
                console.log('Missing dockElem in dockAnim');
                return;
            }
            var speed;
            if (this.options.anim === 'dock') {
                speed = this.dockSpeed;
            } else if (this.options.anim === 'indent') {
                speed = this.indentSpeed;
            }
            var startX = this.options.dockElem.offsetLeft;
            var startY = this.options.dockElem.offsetTop;
            var startWidth = this.options.dockElem.clientWidth;

            var destination = $(r.rNewLinePlaceholder[newRoot]).offset();
            if (r.rUseOldLinePlaceholder[newRoot]) {
                var oldOffset = $(r.rOldLinePlaceholder[newRoot]).offset();
                if (destination.top > oldOffset.top) {
                    destination.top -= r.activeLineHeight[newRoot];
                }
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
    };
    return DockAnimAction;
})(AnimatedAction);
//# sourceMappingURL=DockAnimAction.js.map
