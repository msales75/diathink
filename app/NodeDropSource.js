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
    DropSource.prototype.createDockElem = function () {
        return null;
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
        this.activeLineHeight = {};
        this.rOldLinePlaceholder = {};
        this.activeID = opts.activeID;
        this.outlineID = opts.outlineID;
        this.dockElem = opts.dockElem;
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
        console.log("Source: for view " + activeLineView.id + " got height " + this.activeLineHeight[outline.id]);
        var activeObj = $(activeLineView.elem);

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
    };

    NodeDropSource.prototype.setupPlaceholderAnim = function () {
        var o;
        var startOldHeight;
        var outlines = OutlineRootView.outlinesById;
        for (o in outlines) {
            var placeholder = this.rOldLinePlaceholder[o];
            if (placeholder) {
                startOldHeight = Math.round(this.activeLineHeight[o]);
                console.log("SourcePlaceholder outline " + o + " height " + startOldHeight);
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
                console.log("Source starting from " + startOldHeight + " with fraction " + frac);
                console.log(String(Math.round(startOldHeight * (1 - frac))) + 'px');
            }
        }
    };

    NodeDropSource.prototype.createDockElem = function () {
        if (this.dockElem != null) {
            return this.dockElem;
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

        // if PanelRootAction, change the helper to be just the text instead of activeLineView
        // how do we know if 'source' is a panel?
        this.dockElem = activeLineView.elem.cloneNode(true);
        this.dockElem.id = '';
        var drawlayer = View.getCurrentPage().drawlayer.elem;
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
