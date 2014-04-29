var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="actions/Action.ts"/>
var DropTarget = (function () {
    function DropTarget(opts) {
        this.animOptions = {};
    }
    DropTarget.prototype.createUniquePlaceholder = function () {
    };
    DropTarget.prototype.getPlaceholder = function (i) {
        return null;
    };

    DropTarget.prototype.createViewPlaceholder = function (outline) {
    };

    DropTarget.prototype.setupPlaceholderAnim = function () {
    };

    DropTarget.prototype.placeholderAnimStep = function (frac) {
    };

    DropTarget.prototype.setupDockAnim = function (dockElem) {
    };

    DropTarget.prototype.dockAnimStep = function (frac) {
        if (!this.dockElem) {
            return;
        }
        var endX = this.animOptions.endX, endY = this.animOptions.endY, startX = this.animOptions.startX, startY = this.animOptions.startY;
        var left = Math.round(frac * endX + (1 - frac) * startX);
        var top = Math.round(frac * endY + (1 - frac) * startY);
        var css;
        css = {
            left: left + 'px',
            top: top + 'px'
        };
        var o = this.animOptions;
        if ((this.outlineID === this.oldOutlineID) && (left > startX)) {
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
        $(this.dockElem).css(css);
    };

    DropTarget.prototype.setupDockFade = function () {
    };

    DropTarget.prototype.fadeAnimStep = function (frac) {
    };
    DropTarget.prototype.cleanup = function () {
    };
    return DropTarget;
})();
var NodeDropTarget = (function (_super) {
    __extends(NodeDropTarget, _super);
    function NodeDropTarget(opts) {
        _super.call(this, opts);
        this.createSpeed = 80;
        this.placeholderSpeed = 160;
        this.indentSpeed = 80;
        this.dockSpeed = 160;
        this.activeLineHeight = {};
        this.rNewLinePlaceholder = {};
        this.rNewModelContext = opts.rNewModelContext;
        this.oldOutlineID = opts.outlineID;
        this.outlineID = opts.outlineID;
        this.activeID = opts.activeID;
        var o;
        var outlines = OutlineRootView.outlinesById;
        if (this.activeID != null) {
            for (o in outlines) {
                var activeView = this.getNodeView(this.activeID, o);
                if (activeView != null) {
                    this.activeLineHeight[o] = Math.round(activeView.elem.clientHeight);
                    console.log("Target: For view " + activeView.id + " got height " + this.activeLineHeight[o]);
                    if ((o === this.outlineID) && (o === this.oldOutlineID)) {
                        this.offsetUnderTop = $(activeView.elem).offset().top;
                    }
                }
            }
        }
    }
    NodeDropTarget.prototype.getNodeView = function (id, rootid) {
        var model = OutlineNodeModel.getById(id);
        if (!model) {
            model = OutlineNodeModel.deletedById[id];
        }
        if (model.views == null) {
            return null;
        }
        return model.views[rootid];
    };

    NodeDropTarget.prototype.getPlaceholder = function (i) {
        return this.rNewLinePlaceholder[i];
    };

    NodeDropTarget.prototype.contextParentVisible = function (context, outline) {
        if (!context) {
            return null;
        }
        assert(context.parent != null, "context is null");
        var parent = this.getNodeView(context.parent, outline.nodeRootView.id);
        if (parent != null) {
            return parent.children;
        } else {
            if (OutlineNodeModel.getById(context.parent).get('children') === View.get(outline.nodeRootView.id).value) {
                return outline.nodeRootView;
            } else {
                return null;
            }
        }
    };

    NodeDropTarget.prototype.createViewPlaceholder = function (outline) {
        // if (this.options.anim==='indent') {return;}
        if (!outline) {
            return;
        }
        var newModelContext = this.rNewModelContext;
        var parentView = this.contextParentVisible(newModelContext, outline);
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
    };

    NodeDropTarget.prototype.setupPlaceholderAnim = function () {
        var o;
        var endNewHeight;
        var outlines = OutlineRootView.outlinesById;
        for (o in outlines) {
            if (this.rNewLinePlaceholder[o]) {
                endNewHeight = this.activeLineHeight[o];
                if (!endNewHeight) {
                    endNewHeight = Math.round(1.5 * Number($(document.body).css('font-size').replace(/px/, '')));
                }
                console.log("TargetePlaceholder outline " + o + " height " + endNewHeight);
                if (this.animOptions.view === undefined) {
                    this.animOptions.view = {};
                }
                this.animOptions.view[o] = {
                    endNewHeight: endNewHeight
                };
            }
        }
    };

    NodeDropTarget.prototype.placeholderAnimStep = function (frac) {
        var outlines = OutlineRootView.outlinesById;
        var i;
        if (this.animOptions.view == null) {
            return;
        }
        for (i in outlines) {
            var o = this.animOptions.view[i];
            if (o != null) {
                var maxHeight = o.endNewHeight;
                $(this.rNewLinePlaceholder[i]).css('height', String(maxHeight - Math.round(maxHeight * (1 - frac))) + 'px');
                console.log("Target going to " + maxHeight + " with fraction " + frac);
                console.log(String(maxHeight - Math.round(maxHeight * (1 - frac))) + 'px');
            }
        }
    };

    NodeDropTarget.prototype.setupDockAnim = function (dockElem) {
        this.dockElem = dockElem;

        // Is newLinePlace for this view above or below source?
        if ((this.rNewModelContext == null) || (!this.dockElem)) {
            return;
        }
        if (!this.rNewLinePlaceholder[this.outlineID]) {
            $(document.body).removeClass('transition-mode');
            this.dockElem.parentNode.removeChild(this.dockElem);
            this.dockElem = undefined;

            // console.log('Missing rNewLinePlaceholder in dockAnim');
            return;
        }
        var destination = $(this.rNewLinePlaceholder[this.outlineID]).offset();
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
    };

    NodeDropTarget.prototype.setupDockFade = function () {
    };

    NodeDropTarget.prototype.fadeAnimStep = function () {
    };
    NodeDropTarget.prototype.cleanup = function () {
        // do this after rNewLinePlaceholder has been replaced, so correct element is visible.
        var o;
        var outlines = OutlineRootView.outlinesById;
        for (o in outlines) {
            if (this.rNewLinePlaceholder[o] != null) {
                if (this.rNewLinePlaceholder[o].parentNode) {
                    this.rNewLinePlaceholder[o].parentNode.removeChild(this.rNewLinePlaceholder[o]);
                }
                delete this.rNewLinePlaceholder[o];
                delete this.activeLineHeight[o];
            }

            // restore height if it was lost
            if (this.activeID) {
                var activeView = this.getNodeView(this.activeID, o);
                if (activeView && activeView.elem) {
                    $(activeView.elem).css('height', '').removeClass('drag-hidden');
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
    };
    return NodeDropTarget;
})(DropTarget);
//# sourceMappingURL=NodeDropTarget.js.map
