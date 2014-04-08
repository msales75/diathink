var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../views/View.ts"/>
///<reference path="../PanelManager.ts"/>
var DropBox = (function () {
    function DropBox() {
    }
    DropBox.prototype.handleDrop = function (node, helper) {
    };

    DropBox.renderAll = function (dragger) {
        DropBox.dragger = dragger;
        var p, n, panel, node, n, nid;
        var PM, i;
        PM = PanelManager;
        $('.droplayer').html('');
        var drawlayer = $('#' + View.getCurrentPage().drawlayer.id);
        drawlayer.children('.dropborder').remove();
        $(document.body).addClass('drop-mode');
        $D.lineHeight = Math.round(1.5 * Number($(document.body).css('font-size').replace(/px/, '')));
        var panelParent = (View.getCurrentPage()).content.grid;
        var canvas1 = panelParent.scroll1.outline.droplayer;
        var canvas2 = panelParent.scroll2.outline.droplayer;
        var canvas0 = View.getCurrentPage().drawlayer;
        canvas1.cacheOffset = $(canvas1.elem).offset();
        canvas2.cacheOffset = $(canvas2.elem).offset();
        canvas0.cacheOffset = $(canvas0.elem).offset();
        for (n = 1, p = PM.leftPanel; (p !== '') && (n <= PM.panelsPerScreen); ++n, p = PM.nextpanel[p]) {
            panel = View.get(p);
            panel.cachePosition();
            panel.dropboxes = [];
            panel.dropboxes.push(new DropBoxLeft(panel));
            panel.dropboxes.push(new DropBoxRight(panel));
            for (i = 0; i < panel.dropboxes.length; ++i) {
                panel.dropboxes[i].render();
            }
        }
        for (nid in NodeView.nodesById) {
            node = NodeView.nodesById[nid];
            node.dropboxes = [];
            node.dropboxes.push(new DropBoxTop(node));
            node.dropboxes.push(new DropBoxBottom(node));
            node.dropboxes.push(new DropBoxHandle(node));
            for (i = 0; i < node.dropboxes.length; ++i) {
                node.dropboxes[i].render();
            }
        }
    };

    DropBox.getHoverBox = function (mousePosition, scrollStart) {
        var j, d, n, p;

        // cache scroll-positions of each panel
        var panels = PanelView.panelsById;
        var pid;
        for (pid in panels) {
            var scrollView = panels[pid].outline;
            scrollView.scrollY = scrollView.scrollHandler.getScrollPosition().y;
        }
        var PM;
        PM = PanelManager;

        for (n = 1, p = PM.leftPanel; (p !== '') && (n <= PM.panelsPerScreen); ++n, p = PM.nextpanel[p]) {
            var panel = View.get(p);
            if (panel.dropboxes == null) {
                continue;
            }
            for (j = 0; j < panel.dropboxes.length; ++j) {
                d = panel.dropboxes[j];
                if (!d.valid)
                    continue;
                if (((mousePosition.left >= d.hover.left) && (mousePosition.left <= d.hover.right)) && ((mousePosition.top >= d.hover.top) && (mousePosition.top <= d.hover.bottom))) {
                    return d;
                }
            }
        }
        var nodes = NodeView.nodesById;
        var nid;
        for (nid in nodes) {
            var node = nodes[nid];
            if (node.dropboxes == null) {
                continue;
            }
            for (j = 0; j < node.dropboxes.length; ++j) {
                d = node.dropboxes[j];
                if (!d.valid)
                    continue;
                var parentPanel = node.panelView.outline;
                var y = mousePosition.top;
                y += parentPanel.scrollY - scrollStart[node.panelView.id];
                if (((mousePosition.left >= d.hover.left) && (mousePosition.left <= d.hover.right)) && ((y >= d.hover.top) && (y <= d.hover.bottom))) {
                    //assert(this.scrollPanel && parentPanel.elem === this.scrollPanel.elem,
                    //    "ERROR: Active panel does not match item");
                    return d;
                }
            }
        }
        return null;
    };
    DropBox.previewDropBoxes = function () {
        var i, j, d;
        var PM;
        PM = PanelManager;
        for (var n = 1, p = PM.leftPanel; (p !== '') && (n <= PM.panelsPerScreen); ++n, p = PM.nextpanel[p]) {
            var panel = View.get(p);
            var canvas = $('#' + View.getCurrentPage().drawlayer.id);
            var ctop = canvas.offset().top;
            var cleft = canvas.offset().left;
            if (!panel.dropboxes) {
                console.log("ERROR: Item " + i + " does not have dropboxes?");
                continue;
            }
            for (j = 0; j < panel.dropboxes.length; ++j) {
                d = panel.dropboxes[j];
                if (!d.valid)
                    continue;
                $('<div></div>').appendTo(canvas).css('position', 'absolute').css('top', (d.hover.top - ctop) + 'px').css('left', (d.hover.left - cleft) + 'px').css('width', (d.hover.right - d.hover.left) + 'px').css('height', (d.hover.bottom - d.hover.top) + 'px').css('border', 'dotted red 1px');
            }
        }
        var nodes = NodeView.nodesById;
        var nid;
        for (nid in nodes) {
            var node = nodes[nid];
            var view = node.panelView.outline;
            var canvas = $('#' + view.droplayer.id);
            var ctop = canvas.offset().top;
            var cleft = canvas.offset().left;
            if (!node.dropboxes) {
                console.log("ERROR: Item " + i + " does not have dropboxes?");
                continue;
            }
            for (j = 0; j < node.dropboxes.length; ++j) {
                d = node.dropboxes[j];
                if (!d.valid)
                    continue;
                $('<div></div>').appendTo(canvas).css('position', 'absolute').css('top', (d.hover.top - ctop) + 'px').css('left', (d.hover.left - cleft) + 'px').css('width', (d.hover.right - d.hover.left) + 'px').css('height', (d.hover.bottom - d.hover.top) + 'px').css('border', 'dotted red 1px');
            }
        }
    };

    DropBox.prototype.render = function () {
        if (!this.valid) {
            return;
        }
        this.elem = $('<div></div>').addClass(this.box.class).css('top', this.box.top + 'px').css('left', this.box.left + 'px').css('height', this.box.height + 'px').css('width', this.box.width + 'px').get(0);
        $(this.elem).appendTo(this.canvas.elem);
    };

    DropBox.prototype.destroy = function () {
    };
    return DropBox;
})();
var DropBoxTop = (function (_super) {
    __extends(DropBoxTop, _super);
    function DropBoxTop(node) {
        _super.call(this);
        this.valid = DropBox.dragger.validateNodeDropBox(node, 'top');
        if (!this.valid) {
            return;
        }
        this.view = node;
        this.canvas = node.panelView.outline.droplayer;
        this.box = {
            top: node.position.top - this.canvas.cacheOffset.top,
            left: node.position.left - this.canvas.cacheOffset.left + $D.lineHeight,
            height: 0,
            width: node.dimensions.width - 1.5 * $D.lineHeight,
            class: 'dropborder'
        };
        this.hover = {
            top: node.position.top - $D.lineHeight / 2,
            left: node.position.left + $D.lineHeight,
            bottom: node.position.top + ($D.lineHeight / 2),
            right: node.position.left + node.dimensions.width - $D.lineHeight / 2
        };
    }
    DropBoxTop.prototype.handleDrop = function (node, helper) {
        var that = this;
        ActionManager.schedule(function () {
            return Action.checkTextChange(node.header.name.text.id);
        }, function () {
            return {
                actionType: MoveBeforeAction,
                activeID: node.value.cid,
                referenceID: that.view.value.cid,
                oldRoot: node.nodeRootView.id,
                newRoot: that.view.nodeRootView.id,
                anim: 'dock',
                dockElem: helper,
                focus: false
            };
        });
    };
    return DropBoxTop;
})(DropBox);
var DropBoxBottom = (function (_super) {
    __extends(DropBoxBottom, _super);
    function DropBoxBottom(node) {
        _super.call(this);
        this.valid = DropBox.dragger.validateNodeDropBox(node, 'bottom');
        if (!this.valid) {
            return;
        }
        this.view = node;
        this.canvas = node.panelView.outline.droplayer;
        this.box = {
            top: node.position.top + node.dimensions.height - this.canvas.cacheOffset.top - 1,
            left: node.position.left - this.canvas.cacheOffset.left + $D.lineHeight,
            height: 0,
            width: node.dimensions.width - 1.5 * $D.lineHeight,
            class: 'dropborder'
        };
        this.hover = {
            top: node.position.top + node.dimensions.height - $D.lineHeight / 2,
            left: node.position.left + $D.lineHeight,
            bottom: node.position.top + node.dimensions.height + ($D.lineHeight / 2),
            right: node.position.left + node.dimensions.width - $D.lineHeight / 2
        };
    }
    DropBoxBottom.prototype.handleDrop = function (node, helper) {
        var that = this;
        ActionManager.schedule(function () {
            return Action.checkTextChange(node.header.name.text.id);
        }, function () {
            return {
                actionType: MoveAfterAction,
                activeID: node.value.cid,
                referenceID: that.view.value.cid,
                oldRoot: node.nodeRootView.id,
                newRoot: that.view.nodeRootView.id,
                anim: 'dock',
                dockElem: helper,
                focus: false
            };
        });
    };
    return DropBoxBottom;
})(DropBox);
var DropBoxHandle = (function (_super) {
    __extends(DropBoxHandle, _super);
    function DropBoxHandle(node) {
        _super.call(this);
        this.valid = DropBox.dragger.validateNodeDropBox(node, 'handle');
        if (!this.valid) {
            return;
        }
        this.view = node;
        this.canvas = node.panelView.outline.droplayer;
        this.box = {
            top: node.position.top - this.canvas.cacheOffset.top - 1,
            left: node.position.left - this.canvas.cacheOffset.left - 1,
            class: 'droparrow'
        };
        this.hover = {
            top: node.position.top,
            left: node.position.left,
            bottom: node.position.top + $D.lineHeight,
            right: node.position.left + $D.lineHeight
        };
    }
    DropBoxHandle.prototype.handleDrop = function (node, helper) {
        var that = this;
        ActionManager.schedule(function () {
            return Action.checkTextChange(node.header.name.text.id);
        }, function () {
            return {
                actionType: MoveIntoAction,
                referenceID: that.view.value.cid,
                activeID: node.value.cid,
                oldRoot: node.nodeRootView.id,
                newRoot: that.view.nodeRootView.id,
                anim: 'dock',
                dockElem: helper,
                focus: false
            };
        });
    };
    return DropBoxHandle;
})(DropBox);
var DropBoxLeft = (function (_super) {
    __extends(DropBoxLeft, _super);
    function DropBoxLeft(panel) {
        _super.call(this);
        this.valid = DropBox.dragger.validatePanelDropBox(panel, 'left');
        if (!this.valid) {
            return;
        }
        this.view = panel;
        this.canvas = View.currentPage.drawlayer;
        this.box = {
            top: panel.top - this.canvas.cacheOffset.top,
            left: panel.left - this.canvas.cacheOffset.left - 1 - 5,
            height: panel.height,
            width: 0,
            class: 'dropborder'
        };
        this.hover = {
            top: panel.top,
            left: panel.left - 5 - 5,
            bottom: panel.top + panel.height,
            right: panel.left - 5 + 5
        };
    }
    DropBoxLeft.prototype.handleDrop = function (node, helper) {
        var that = this;
        ActionManager.schedule(function () {
            return Action.checkTextChange(node.header.name.text.id);
        }, function () {
            return {
                actionType: PanelCreateAction,
                activeID: node.value.cid,
                prevPanel: PanelManager.prevpanel[that.view.id],
                oldRoot: node.nodeRootView.id,
                newRoot: 'new',
                dockElem: helper,
                focus: false
            };
        });
    };
    return DropBoxLeft;
})(DropBox);
var DropBoxRight = (function (_super) {
    __extends(DropBoxRight, _super);
    function DropBoxRight(panel) {
        _super.call(this);
        this.valid = DropBox.dragger.validatePanelDropBox(panel, 'right');
        if (!this.valid) {
            return;
        }
        this.view = panel;
        this.canvas = View.currentPage.drawlayer;
        this.box = {
            top: panel.top - this.canvas.cacheOffset.top,
            left: panel.left + panel.width - this.canvas.cacheOffset.left - 1 + 5,
            height: panel.height,
            width: 0,
            class: 'dropborder'
        };
        this.hover = {
            top: panel.top,
            left: panel.left + panel.width + 5 - 5,
            bottom: panel.top + panel.height,
            right: panel.left + panel.width + 5 + 5
        };
    }
    DropBoxRight.prototype.handleDrop = function (node, helper) {
        var that = this;
        ActionManager.schedule(function () {
            return Action.checkTextChange(node.header.name.text.id);
        }, function () {
            return {
                actionType: PanelCreateAction,
                activeID: node.value.cid,
                prevPanel: that.view.id,
                oldRoot: node.nodeRootView.id,
                newRoot: 'new',
                dockElem: helper,
                focus: false
            };
        });
    };
    return DropBoxRight;
})(DropBox);
//# sourceMappingURL=DropBox.js.map
