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
        this.rOldLinePlaceholder = {};
        this.activeID = opts.activeID;
        this.outlineID = opts.outlineID;
        this.dockView = opts.dockView;
        this.useDock = opts.useDock;
        this.dockTextOnly = opts.dockTextOnly;
        this.usePlaceholder = opts.usePlaceholder;
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
        if (!this.usePlaceholder) {
            return;
        }
        if (this.activeID == null) {
            return;
        }
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

        // console.log("Source: for view "+activeLineView.id+" got height "+this.activeLineHeight[outline.id]);
        var activeObj = $(activeLineView.elem);

        // console.log("Creating placeholder with css-height=" + activeLineHeight);
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
    };

    NodeDropSource.prototype.setupPlaceholderAnim = function () {
        var o;
        var startOldHeight;
        var outlines = OutlineRootView.outlinesById;
        for (o in outlines) {
            var placeholder = this.rOldLinePlaceholder[o];
            if (placeholder) {
                startOldHeight = Math.round(this.activeLineHeight[o]);

                // console.log("SourcePlaceholder outline "+o+" height "+startOldHeight);
                if (this.animOptions.view === undefined) {
                    this.animOptions.view = {};
                }
                this.animOptions.view[o] = {
                    startOldHeight: startOldHeight
                };
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
                var startOldHeight = o.startOldHeight;
                $(this.rOldLinePlaceholder[i]).css('height', String(Math.round(startOldHeight * (1 - frac))) + 'px');
                // console.log("Source starting from "+startOldHeight+" with fraction "+frac);
                // console.log(String(Math.round(startOldHeight * (1 - frac))) + 'px');
            }
        }
    };
    NodeDropSource.prototype.createTextFromNode = function (node) {
        var elem = node.header.name.text.elem;
        var offset = $(elem).offset();
        var paddingLeft = Number($(elem).css('padding-left').replace('px', ''));
        var paddingRight = Number($(elem).css('padding-right').replace('px', ''));
        var paddingTop = Number($(elem).css('padding-top').replace('px', ''));
        var paddingBottom = Number($(elem).css('padding-bottom').replace('px', ''));
        var paddingWidth = paddingLeft + paddingRight;
        var paddingHeight = paddingTop + paddingBottom;
        var width = elem.clientWidth - paddingWidth;
        var height = elem.clientHeight - paddingHeight;
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
            var offset = $(activeLineView.elem).offset();
            $(this.dockView.elem).css({
                position: 'absolute',
                left: (offset.left) + 'px',
                top: (offset.top) + 'px',
                width: (activeLineView.elem.clientWidth) + 'px',
                height: (activeLineView.elem.clientHeight) + 'px'
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
        var o;
        var outlines = OutlineRootView.outlinesById;
        for (o in outlines) {
            if (this.rOldLinePlaceholder[o] != null) {
                if (this.rOldLinePlaceholder[o].parentNode) {
                    this.rOldLinePlaceholder[o].parentNode.removeChild(this.rOldLinePlaceholder[o]);
                }
                delete this.rOldLinePlaceholder[o];
            }
        }
    };
    return NodeDropSource;
})(DropSource);
//# sourceMappingURL=NodeDropSource.js.map
