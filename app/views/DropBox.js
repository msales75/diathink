var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../views/View.ts"/>
var DropBox = (function () {
    function DropBox(view) {
        this.view = view;
        this.valid = this.validateDrop(DropBox.dragger.currentItem);
    }
    DropBox.prototype.validateDrop = function (activeView) {
        return true;
    };
    DropBox.prototype.handleDrop = function (node, helper) {
    };
    DropBox.removeAll = function () {
        var i, nid, pid;
        var panels = PanelView.panelsById;
        var nodes = NodeView.nodesById;
        for (nid in nodes) {
            if (nodes[nid].nodeRootView != null) {
                var boxes = nodes[nid].dropboxes;
                for (i = 0; i < boxes.length; ++i) {
                    boxes[i].remove();
                }
                nodes[nid].dropboxes = [];
            }
        }
        for (pid in panels) {
            var boxes = panels[pid].dropboxes;
            for (i = 0; i < boxes.length; ++i) {
                boxes[i].remove();
            }
            panels[pid].dropboxes = [];
        }
    };
    DropBox.renderAll = function (dragger) {
        DropBox.dragger = dragger;
        var i, p, n, panel, node, nid;

        DropBox.removeAll();
        $(document.body).addClass('drop-mode');

        $D.lineHeight = Math.round(1.5 * Number($(document.body).css('font-size').replace(/px/, '')));
        var panelParent = (View.getCurrentPage()).content.gridwrapper.grid;
        var canvas0 = View.getCurrentPage().drawlayer;
        canvas0.cacheOffset = $(canvas0.elem).offset();

        var m;
        var panels = panelParent.listItems;
        for (m = panels.first(); m !== ''; m = panels.next[m]) {
            var canvas1 = panels.obj[m].outline.droplayer;
            canvas1.cacheOffset = $(canvas1.elem).offset();
        }

        var panels = View.getCurrentPage().content.gridwrapper.grid.listItems;
        var pid;

        for (pid = panels.first(); pid !== ''; pid = panels.next[pid]) {
            panel = View.get(pid);
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
            if (node.nodeRootView != null) {
                node.dropboxes = [];
                node.dropboxes.push(new DropBoxTop(node));
                node.dropboxes.push(new DropBoxBottom(node));
                node.dropboxes.push(new DropBoxHandle(node));
                for (i = 0; i < node.dropboxes.length; ++i) {
                    node.dropboxes[i].render();
                }
            }
        }
    };
    DropBox.getHoverBox = function (mousePosition, scrollStart) {
        var j, d;

        // cache scroll-positions of each panel
        var pid;
        var panels = View.getCurrentPage().content.gridwrapper.grid.listItems;

        for (pid = panels.first(); pid !== ''; pid = panels.next[pid]) {
            var panel = View.get(pid);
            var scrollView = panel.outline;
            scrollView.scrollY = scrollView.scrollHandler.getScrollPosition().y;
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
        var pid;
        var panels = View.getCurrentPage().content.gridwrapper.grid.listItems;
        for (pid = panels.first(); pid !== ''; pid = panels.next[pid]) {
            var panel = View.get(pid);
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
            if (node.nodeRootView == null) {
                continue;
            }
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

    DropBox.prototype.onHover = function () {
        $(this.elem).addClass('active');
    };
    DropBox.prototype.onLeave = function () {
        $(this.elem).removeClass('active');
    };
    DropBox.prototype.render = function () {
        if (!this.valid) {
            return;
        }
        this.elem = $('<div></div>').addClass(this.box.class).css('top', this.box.top + 'px').css('left', this.box.left + 'px').css('height', this.box.height + 'px').css('width', this.box.width + 'px').get(0);
        $(this.elem).appendTo(this.canvas.elem);
    };

    DropBox.prototype.validateNodeBox = function (activeNode, type) {
        var targetNode = this.view;

        // cannot drop current-item on itself
        if (targetNode === activeNode) {
            return false;
        }

        // cannot drop the current-item inside itself
        var activeModel = activeNode.value;
        var itemModel = targetNode.value;
        var model = itemModel;
        while ((model != null) && (model !== activeModel)) {
            model = model.get('parent');
        }
        if (model != null) {
            return false;
        }

        // cannot drop current-item adjacent to itself
        if (activeModel.get('parent') === itemModel.get('parent')) {
            var nodes = activeModel.get('parent').attributes.children;
            if (nodes.next[itemModel.cid] === activeModel.cid) {
                if (type === 'bottom')
                    return false;
            } else if (nodes.next[activeModel.cid] === itemModel.cid) {
                if (type === 'top')
                    return false;
            }
        }
        if (activeModel.get('parent') === itemModel) {
            if (type === 'handle')
                return false;
        }
        var prevElement = targetNode.elem.previousSibling;
        if (prevElement && View.getFromElement(prevElement).nodeView.children.elem.children.length !== 0) {
            // predecessor has visible children, cannot drop above it
            if (type === 'top')
                return false;
        }
        if (targetNode.children.elem.children.length !== 0) {
            // has visible children, cannot drop below it
            if (type === 'bottom')
                return false;
        }
        if (targetNode.elem.nextSibling != null) {
            // not last in a list, cannot drop below it
            if (type === 'bottom')
                return false;
        }
        return true;
    };

    DropBox.prototype.remove = function () {
        if (this.elem && this.elem.parentNode) {
            this.elem.parentNode.removeChild(this.elem);
        }
    };
    return DropBox;
})();
var DropBoxTop = (function (_super) {
    __extends(DropBoxTop, _super);
    function DropBoxTop(node) {
        _super.call(this, node);
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
        ActionManager.simpleSchedule(View.focusedView, function () {
            return {
                actionType: MoveBeforeAction,
                activeID: node.value.cid,
                referenceID: that.view.value.cid,
                oldRoot: node.nodeRootView.id,
                newRoot: that.view.nodeRootView.id,
                anim: 'dock',
                dockView: helper,
                focus: false
            };
        });
    };
    DropBoxTop.prototype.validateDrop = function (activeNode) {
        return this.validateNodeBox(activeNode, 'top');
    };
    return DropBoxTop;
})(DropBox);
var DropBoxBottom = (function (_super) {
    __extends(DropBoxBottom, _super);
    function DropBoxBottom(node) {
        _super.call(this, node);
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
        ActionManager.simpleSchedule(View.focusedView, function () {
            return {
                actionType: MoveAfterAction,
                activeID: node.value.cid,
                referenceID: that.view.value.cid,
                oldRoot: node.nodeRootView.id,
                newRoot: that.view.nodeRootView.id,
                anim: 'dock',
                dockView: helper,
                focus: false
            };
        });
    };
    DropBoxBottom.prototype.validateDrop = function (activeNode) {
        return this.validateNodeBox(activeNode, 'bottom');
    };
    return DropBoxBottom;
})(DropBox);
var DropBoxHandle = (function (_super) {
    __extends(DropBoxHandle, _super);
    function DropBoxHandle(node) {
        _super.call(this, node);
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
        ActionManager.simpleSchedule(View.focusedView, function () {
            return {
                actionType: MoveIntoAction,
                referenceID: that.view.value.cid,
                activeID: node.value.cid,
                oldRoot: node.nodeRootView.id,
                newRoot: that.view.nodeRootView.id,
                anim: 'dock',
                dockView: helper,
                focus: false
            };
        });
    };
    DropBoxHandle.prototype.validateDrop = function (activeNode) {
        return this.validateNodeBox(activeNode, 'handle');
    };
    return DropBoxHandle;
})(DropBox);
var DropBoxLeft = (function (_super) {
    __extends(DropBoxLeft, _super);
    function DropBoxLeft(panel) {
        _super.call(this, panel);
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
        ActionManager.simpleSchedule(View.focusedView, function () {
            return {
                actionType: PanelCreateAction,
                activeID: node.value.cid,
                prevPanel: View.getCurrentPage().content.gridwrapper.grid.listItems.prev[that.view.id],
                oldRoot: node.nodeRootView.id,
                newRoot: 'new',
                dockView: helper,
                focus: false
            };
        });
    };
    DropBoxLeft.prototype.validateDrop = function (activeNode) {
        if (View.getCurrentPage().content.gridwrapper.grid.listItems.first() === this.view.id) {
            return true;
        }
        return false;
    };
    return DropBoxLeft;
})(DropBox);
var DropBoxRight = (function (_super) {
    __extends(DropBoxRight, _super);
    function DropBoxRight(panel) {
        _super.call(this, panel);
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
        ActionManager.simpleSchedule(View.focusedView, function () {
            return {
                actionType: PanelCreateAction,
                activeID: node.value.cid,
                prevPanel: that.view.id,
                oldRoot: node.nodeRootView.id,
                newRoot: 'new',
                dockView: helper,
                focus: false
            };
        });
    };
    DropBoxRight.prototype.validateDrop = function (activeNode) {
        return true;
    };
    return DropBoxRight;
})(DropBox);
//# sourceMappingURL=DropBox.js.map
