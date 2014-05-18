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
    DropTarget.prototype.getOffset = function () {
        return null;
    };

    DropTarget.prototype.createViewPlaceholder = function (outline) {
    };

    DropTarget.prototype.setupPlaceholderAnim = function () {
    };

    DropTarget.prototype.placeholderAnimStep = function (frac) {
    };

    DropTarget.prototype.setupDockAnim = function (dockView) {
    };

    DropTarget.prototype.dockAnimStep = function (frac) {
        if (!this.dockView) {
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
        $(this.dockView.elem).css(css);
    };
    DropTarget.prototype.postAnimSetup = function () {
    };
    DropTarget.prototype.postAnimStep = function (frac) {
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
        this.stopAt = null;
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
                    this.activeLineHeight[o] = activeView.layout.height;

                    // console.log("Target: For view "+activeView.id+" got height "+this.activeLineHeight[o]);
                    if ((o === this.outlineID) && (o === this.oldOutlineID)) {
                        this.offsetUnderTop = activeView.getOffset().top;
                    }
                }
            }
        }
        this.stopAt = opts.stopAt;
        this.reversed = opts.reversed;
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
            // console.log('NodeDropTarget 1');
            return;
        }
        var layout = {};
        if (newModelContext.next) {
            var view = this.getNodeView(newModelContext.next, outline.id);
            layout = view.getOffset();
            //console.log('NodeDropTarget 2');
        } else {
            layout = parentView.getOffset();
            layout.top += parentView.layout.height;
            //console.log('NodeDropTarget 3');
        }
        if (this.offsetUnderTop != null) {
            if (layout.top > this.offsetUnderTop) {
                layout.top -= this.activeLineHeight[outline.id];
                //console.log('NodeDropTarget 4');
            } else {
                //console.log('NodeDropTarget 5');
            }
        } else {
            //console.log('NodeDropTarget 6'); // todo: never tested (creation/deletion?)
        }
        layout.height = this.activeLineHeight[outline.id];
        this.rNewLinePlaceholder[outline.id] = layout;
        /*
        var place = $('<li></li>').addClass('li-placeholder').css({
        position: 'absolute',
        top: layout.top+'px',
        left: layout.left+'px',
        height: '0px',
        width: layout.width+'px'
        });
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
        */
    };

    NodeDropTarget.prototype.setupPlaceholderAnim = function () {
        var o;
        var endNewHeight;
        var outlines = OutlineRootView.outlinesById;
        for (o in outlines) {
            if (this.rNewLinePlaceholder[o]) {
                endNewHeight = this.rNewLinePlaceholder[o].height;
                if (!endNewHeight) {
                    endNewHeight = Math.round(1.5 * Number($(document.body).css('font-size').replace(/px/, '')));
                    //console.log('NodeDropTarget 7');
                } else {
                    //console.log('NodeDropTarget 8');
                }

                // console.log("TargetePlaceholder outline "+o+" height "+endNewHeight);
                if (this.animOptions.view === undefined) {
                    this.animOptions.view = {};
                    //console.log('NodeDropTarget 9');
                }
                var newModelContext = this.rNewModelContext;
                var parentView = this.contextParentVisible(newModelContext, outlines[o]);
                var parentHeight = parentView.layout.height;
                if (newModelContext.next) {
                    var nextView = this.getNodeView(newModelContext.next, o);
                    var nextTop = nextView.layout.top;
                    //console.log('NodeDropTarget 10');
                } else {
                    //console.log('NodeDropTarget 11');
                }

                this.animOptions.view[o] = {
                    endNewHeight: endNewHeight,
                    nextView: nextView,
                    nextTop: nextTop,
                    parentView: parentView,
                    parentHeight: parentHeight
                };
            }
        }
    };

    NodeDropTarget.prototype.placeholderAnimStep = function (frac) {
        var outlines = OutlineRootView.outlinesById;
        var i;
        if (this.animOptions.view == null) {
            //console.log('NodeDropTarget 12'); // never tested (ok)
            return;
        }
        for (i in outlines) {
            var o = this.animOptions.view[i];
            if (o != null) {
                var maxHeight = o.endNewHeight;

                //$(this.rNewLinePlaceholder[i]).css('height',
                //    String(Math.round(maxHeight * frac)) + 'px');
                // could top==end if it's not activeID?
                // top=end means that the target is top-level, hene =activeID
                if ((this.stopAt != null) && (this.stopAt.top === this.activeID)) {
                    if ((this.stopAt.end != null) && (o.nextView != null)) {
                        assert(this.reversed === true, "Wrong value for reversed");
                        o.nextView.layout.top = o.nextTop + o.endNewHeight * frac;
                        $(o.nextView.elem).css('top', o.nextView.layout.top + 'px');
                        if (this.stopAt.top !== this.stopAt.end) {
                            var end = OutlineNodeModel.getById(this.stopAt.end).views[i];
                            assert(end != null, "End-view should be visible");
                            o.parentView.positionChildren(o.nextView, end.id);
                            //console.log('NodeDropTarget 13');
                        } else {
                            //console.log('NodeDropTarget 14');
                        }
                    } else {
                        //console.log('NodeDropTarget 15');
                    }
                } else {
                    if (o.nextView != null) {
                        o.nextView.layout.top = o.nextTop + o.endNewHeight * frac;
                        $(o.nextView.elem).css('top', o.nextView.layout.top + 'px');

                        // console.log("Target: Setting "+ o.nextView.id+" top to "+ o.nextView.layout.top);
                        o.parentView.positionChildren(o.nextView);
                        //console.log('NodeDropTarget 16');
                    } else {
                        //console.log('NodeDropTarget 17');
                    }

                    // propagate upwards
                    o.parentView.layout.height = o.parentHeight + o.endNewHeight * frac;
                    $(o.parentView.elem).css('height', o.parentView.layout.height + 'px');

                    // console.log("Target: Setting "+ o.parentView.id+" height to "+ o.parentView.layout.height);
                    if (o.parentView.parentView instanceof NodeView) {
                        o.parentView.parentView.resizeUp(this.stopAt); // updates parents based on height
                        //console.log('NodeDropTarget 18');
                    } else {
                        //console.log('NodeDropTarget 19'); // todo: never tested (ok)
                    }
                }
                // console.log("Target going to "+maxHeight+" with fraction "+frac);
                // console.log(String(maxHeight - Math.round(maxHeight * (1 - frac))) + 'px');
            } else {
                //console.log('NodeDropTarget 20');
            }
        }
    };

    NodeDropTarget.prototype.setupDockAnim = function (dockView) {
        this.dockView = dockView;

        // Is newLinePlace for this view above or below source?
        if ((this.rNewModelContext == null) || (!this.dockView)) {
            return;
        }
        if (!this.rNewLinePlaceholder[this.outlineID]) {
            $(document.body).removeClass('transition-mode');
            this.dockView.destroy();
            this.dockView = undefined;

            // console.log('Missing rNewLinePlaceholder in dockAnim');
            return;
        }
        var startX = this.dockView.elem.offsetLeft;
        var startY = this.dockView.elem.offsetTop;
        var startWidth = this.dockView.elem.clientWidth;
        this.dockView.addClass('ui-first-child').addClass('ui-last-child');

        // todo: inject speed and take max-duration?
        _.extend(this.animOptions, {
            startX: startX,
            startY: startY,
            endX: this.rNewLinePlaceholder[this.outlineID].left,
            endY: this.rNewLinePlaceholder[this.outlineID].top,
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
            /*
            if (this.rNewLinePlaceholder[o]!=null) {
            if (this.rNewLinePlaceholder[o].parentNode) {
            this.rNewLinePlaceholder[o].parentNode.removeChild(this.rNewLinePlaceholder[o]);
            }
            delete this.rNewLinePlaceholder[o];
            delete this.activeLineHeight[o];
            } */
            // restore height if it was lost
            if (this.activeID) {
                var activeView = this.getNodeView(this.activeID, o);
                if (activeView && activeView.elem) {
                    $(activeView.elem).css('height', activeView.layout.height + 'px').removeClass('drag-hidden');
                }
            }
        }
        if (this.dockView) {
            $(document.body).removeClass('transition-mode');
            this.dockView.destroy();
            this.dockView = undefined;
        }
    };
    return NodeDropTarget;
})(DropTarget);
//# sourceMappingURL=NodeDropTarget.js.map
