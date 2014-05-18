var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="actions/Action.ts"/>
var DropSource = (function () {
    function DropSource(opts) {
        this.animOptions = {};
    }
    DropSource.prototype.getNodeView = function (id, rootid) {
        return null;
    };

    DropSource.prototype.createUniquePlaceholder = function () {
    };

    DropSource.prototype.createViewPlaceholder = function (outline) {
    };

    DropSource.prototype.setupPlaceholderAnim = function () {
    };

    DropSource.prototype.placeholderAnimStep = function (frac) {
    };

    DropSource.prototype.postAnimSetup = function () {
    };

    DropSource.prototype.postAnimStep = function (frac) {
    };

    DropSource.prototype.createDockElem = function () {
        if (this.dockView) {
            return this.dockView;
        } else {
            return null;
        }
    };

    DropSource.prototype.getHelperParams = function () {
    };

    DropSource.prototype.cleanup = function () {
    };
    return DropSource;
})();
var NodeDropSource = (function (_super) {
    __extends(NodeDropSource, _super);
    function NodeDropSource(opts) {
        _super.call(this, opts);
        this.deleteSpeed = 80;
        this.placeholderSpeed = 160;
        this.dockTextOnly = false;
        this.activeLineHeight = {};
        // rOldLinePlaceholder:{[i:string]:HTMLElement} = {};
        this.stopAt = null;
        this.activeID = opts.activeID;
        this.outlineID = opts.outlineID;
        this.dockView = opts.dockView;
        this.useDock = opts.useDock;
        this.dockTextOnly = opts.dockTextOnly;
        this.usePlaceholder = opts.usePlaceholder;
        this.stopAt = opts.stopAt;
        this.reversed = opts.reversed;
    }
    NodeDropSource.prototype.getNodeView = function (id, rootid) {
        var model = OutlineNodeModel.getById(id);
        if (!model) {
            model = OutlineNodeModel.deletedById[id];
        }
        if (model.views == null) {
            return null;
        }
        return model.views[rootid];
    };

    NodeDropSource.prototype.createViewPlaceholder = function (outline) {
        // console.log("Source: for view "+activeLineView.id+" got height "+this.activeLineHeight[outline.id]);
        // var activeObj:JQuery = $(activeLineView.elem);
        // console.log("Creating placeholder with css-height=" + activeLineHeight);
        /*
        var rOldLinePlaceholder = $('<li></li>').addClass('li-placeholder').css({
        position: 'absolute',
        top: activeLineView.layout.top+'px',
        left: activeLineView.layout.left+'px',
        height: activeLineView.layout.height+'px',
        width: activeLineView.layout.width+'px'
        });
        */
        // if (activeObj.hasClass('ui-first-child')) {
        // rOldLinePlaceholder.addClass('ui-first-child');
        // }
        // if (activeObj.hasClass('ui-last-child')) {
        // rOldLinePlaceholder.addClass('ui-last-child');
        // }
        // if placeholder is present, old activeLineView-element must be removed.
        // activeObj[0].parentNode.replaceChild(rOldLinePlaceholder[0], activeObj[0]);
        // activeObj is here removed from DOM, though still has a view.
        // this.rOldLinePlaceholder[outline.nodeRootView.id] = rOldLinePlaceholder[0];
    };

    NodeDropSource.prototype.setupPlaceholderAnim = function () {
        var o;
        var startOldHeight;
        var outlines = OutlineRootView.outlinesById;
        if (!this.usePlaceholder) {
            return;
        }
        if (this.activeID == null) {
            return;
        }

        for (o in outlines) {
            var activeView = this.getNodeView(this.activeID, o);
            if (!activeView) {
                continue;
            }
            assert($('#' + activeView.id).length > 0, 'ERROR: activeLineView ' + activeView.id + ' exists but has not element for oldLinePlace');

            // vanish if not already hidden & shrink over 80ms
            activeView.addClass('drag-hidden');
            var activeLineHeight = activeView.layout.height;
            this.activeLineHeight[o] = activeLineHeight;

            var nextView;
            if ((this.stopAt != null) && (this.stopAt.top === this.activeID) && (this.stopAt.end == null)) {
                //console.log('NodeDropSource 2');
                nextView = null;
            } else {
                nextView = View.get(activeView.parentView.listItems.next[activeView.id]);
                var nextTop = null;
                if (nextView != null) {
                    nextTop = nextView.layout.top;
                    //console.log('NodeDropSource 3');
                } else {
                    //console.log('NodeDropSource 4');
                }
            }
            var parentHeight = activeView.parentView.layout.height;

            // var placeholder:HTMLElement = this.rOldLinePlaceholder[o];
            if (this.activeLineHeight[o]) {
                startOldHeight = Math.round(this.activeLineHeight[o]);

                // console.log("SourcePlaceholder outline "+o+" height "+startOldHeight);
                if (this.animOptions.view === undefined) {
                    this.animOptions.view = {};
                    //console.log('NodeDropSource 5');
                }
                this.animOptions.view[o] = {
                    startOldHeight: startOldHeight,
                    parentView: activeView.parentView,
                    nextView: nextView,
                    nextTop: nextTop,
                    parentHeight: parentHeight
                };
            } else {
                //console.log('NodeDropSource 6'); // never tested (not critical)
            }
        }
    };

    NodeDropSource.prototype.placeholderAnimStep = function (frac) {
        var outlines = OutlineRootView.outlinesById;
        var i;
        if (this.animOptions.view == null) {
            return;
        }
        for (i in outlines) {
            var o = this.animOptions.view[i];
            if (o != null) {
                //$(this.rOldLinePlaceholder[i]).css('height',
                //    String(Math.round(o.startOldHeight * (1 - frac))) + 'px');
                if ((this.stopAt != null) && (this.stopAt.top === this.activeID)) {
                    if ((this.stopAt.end != null) && (o.nextView != null)) {
                        assert(this.reversed === false, "Wrong value for reversed");
                        o.nextView.layout.top = o.nextTop - o.startOldHeight * frac;
                        $(o.nextView.elem).css('top', o.nextView.layout.top + 'px');
                        if (this.stopAt.end !== this.stopAt.top) {
                            var end = OutlineNodeModel.getById(this.stopAt.end).views[i];
                            assert(end != null, "End-view should be visible");
                            o.parentView.positionChildren(o.nextView, end.id);
                            //console.log ('NodeDropSource 7');
                        } else {
                            // source-top = destination.prev, so stop.
                            //console.log ('NodeDropSource 8'); // todo: test this
                        }
                    }
                } else {
                    if (o.nextView != null) {
                        o.nextView.layout.top = o.nextTop - o.startOldHeight * frac;
                        $(o.nextView.elem).css('top', o.nextView.layout.top + 'px');
                        o.parentView.positionChildren(o.nextView);
                        //console.log('NodeDropSource 9');
                    }

                    // propagate upwards
                    o.parentView.layout.height = o.parentHeight - o.startOldHeight * frac;
                    $(o.parentView.elem).css('height', o.parentView.layout.height + 'px');
                    if (o.parentView.parentView instanceof NodeView) {
                        o.parentView.parentView.resizeUp(this.stopAt); // updates parents based on height
                        //console.log('NodeDropSource 10');
                    } else {
                        //console.log('NodeDropSource 11'); // never tested/used
                    }
                }
                // console.log("Source starting from "+startOldHeight+" with fraction "+frac);
                // console.log(String(Math.round(startOldHeight * (1 - frac))) + 'px');
            } else {
                //console.log('NodeDropSource 12');
            }
        }
    };

    NodeDropSource.prototype.createTextFromNode = function (node) {
        var elem = node.header.name.text.elem;
        var offset = node.header.name.text.getOffset();
        var paddingLeft = Number($(elem).css('padding-left').replace('px', ''));
        var paddingRight = Number($(elem).css('padding-right').replace('px', ''));
        var paddingTop = Number($(elem).css('padding-top').replace('px', ''));
        var paddingBottom = Number($(elem).css('padding-bottom').replace('px', ''));
        var paddingWidth = paddingLeft + paddingRight;
        var paddingHeight = paddingTop + paddingBottom;
        var width = node.header.name.text.layout.width - paddingWidth;
        var height = node.header.name.text.layout.height - paddingHeight;
        this.dockView = new ContainerView({ parentView: View.currentPage.drawlayer });
        this.dockView.render();
        this.dockView.elem.innerHTML = node.header.name.text.elem.innerHTML;
        $(this.dockView.elem).css({
            position: 'absolute',
            'z-index': 2,
            top: (offset.top + paddingTop) + 'px',
            left: (offset.left + paddingLeft) + 'px',
            width: width + 'px',
            height: height + 'px',
            'line-height': $(elem).css('line-height'),
            'font-size': $(elem).css('font-size'),
            color: $(elem).css('color'),
            'background': 'transparent'
        }).appendTo(View.currentPage.drawlayer.elem);
    };

    NodeDropSource.prototype.createDockElem = function () {
        if (!this.useDock) {
            return null;
        }
        if (this.dockView != null) {
            if (!this.dockTextOnly) {
                return this.dockView;
            }
            var node = this.dockView;
            this.createTextFromNode(node);
            node.destroy(); // todo?: add fade-out?
            $(document.body).addClass('transition-mode');
            return this.dockView;
        }
        if (this.activeID == null) {
            return null;
        }
        var activeLineView = this.getNodeView(this.activeID, this.outlineID);
        if (!activeLineView) {
            return null;
        }
        if (!activeLineView.elem) {
            console.log('ERROR: activeLineView exists with missing element');
            debugger;
        }
        if (this.dockTextOnly) {
            this.createTextFromNode(activeLineView);
        } else {
            this.dockView = new NodeView({
                parentView: View.currentPage.drawlayer,
                value: activeLineView.value,
                isCollapsed: activeLineView.isCollapsed
            });
            this.dockView.renderAt({ parent: View.currentPage.drawlayer.elem });
            this.dockView.themeFirst(true);
            this.dockView.themeLast(true);
            var offset = activeLineView.getOffset();
            $(this.dockView.elem).css({
                position: 'absolute',
                left: (offset.left) + 'px',
                top: (offset.top) + 'px',
                width: (activeLineView.layout.width) + 'px',
                height: (activeLineView.layout.height) + 'px'
            });
        }

        // if PanelRootAction, change the helper to be just the text instead of activeLineView
        // how do we know if 'source' is a panel?
        $(document.body).addClass('transition-mode');
        return this.dockView;
    };

    NodeDropSource.prototype.getHelperParams = function () {
    };

    NodeDropSource.prototype.cleanup = function () {
        /*
        var o:string;
        var outlines = OutlineRootView.outlinesById;
        for (o in outlines) {
        if (this.rOldLinePlaceholder[o] != null) {
        if (this.rOldLinePlaceholder[o].parentNode) {
        this.rOldLinePlaceholder[o].parentNode.removeChild(this.rOldLinePlaceholder[o]);
        }
        delete this.rOldLinePlaceholder[o];
        }
        }
        */
    };
    return NodeDropSource;
})(DropSource);
//# sourceMappingURL=NodeDropSource.js.map
