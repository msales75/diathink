///<reference path="../views/View.ts"/>
///<reference path="../PanelManager.ts"/>
class DropBox {
    valid:boolean;
    view:View;
    canvas:View;
    static dragger:DragHandler;
    box:{
        top?:number;
        left?:number;
        width?:number;
        height?:number;
        class?:string
    };
    hover:{
        top?:number;
        left?:number;
        right?:number;
        bottom?:number;
    };
    elem:HTMLElement;
    handleDrop(node:NodeView, helper:HTMLElement) {

    }

    static renderAll(dragger:DragHandler) {
        DropBox.dragger = dragger;
        var p:string, n:number, panel:PanelView, node:NodeView, n:number, nid:string;
        var PM:typeof PanelManager, i:number;
        PM = PanelManager;
        $('.droplayer').html('');
        var drawlayer = $('#' + (<DiathinkView>View.getCurrentPage()).drawlayer.id);
        drawlayer.children('.dropborder').remove();
        $(document.body).addClass('drop-mode');
        $D.lineHeight = Math.round(1.5 * Number($(document.body).css('font-size').replace(/px/, '')));
        var panelParent = (View.getCurrentPage()).content.grid;
        var canvas1 = panelParent.scroll1.outline.droplayer;
        var canvas2 = panelParent.scroll2.outline.droplayer;
        var canvas0 = (<DiathinkView>View.getCurrentPage()).drawlayer;
        canvas1.cacheOffset = $(canvas1.elem).offset();
        canvas2.cacheOffset = $(canvas2.elem).offset();
        canvas0.cacheOffset = $(canvas0.elem).offset();
        for (n = 1, p = <string>PM.leftPanel;
            (p !== '') && (n <= PM.panelsPerScreen);
            ++n, p = <string>PM.nextpanel[p]) {
            panel = <PanelView>View.get(p);
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
    }

    static getHoverBox(mousePosition:PositionI, scrollStart:{[i:string]:number}):DropBox {
        var j:number, d:DropBox, n:number, p:string;
        // cache scroll-positions of each panel
        var panels = PanelView.panelsById;
        var pid:string;
        for (pid in panels) {
            var scrollView:OutlineScrollView = panels[pid].outline;
            scrollView.scrollY = scrollView.scrollHandler.getScrollPosition().y;
        }
        var PM:typeof PanelManager;
        PM = PanelManager;
        // loop over panels to return correct dropbox
        for (n = 1, p = PM.leftPanel;
            (p !== '') && (n <= PM.panelsPerScreen);
            ++n, p = PM.nextpanel[p]) {
            var panel = View.get(p);
            if (panel.dropboxes == null) {continue;} // when mousedrag is called before initialization
            for (j = 0; j < panel.dropboxes.length; ++j) {
                d = panel.dropboxes[j];
                if (!d.valid) continue;
                if (((mousePosition.left >= d.hover.left) && (mousePosition.left <= d.hover.right)) &&
                    ((mousePosition.top >= d.hover.top) && (mousePosition.top <= d.hover.bottom))) {
                    return d;
                }
            }
        }
        var nodes = NodeView.nodesById;
        var nid:string;
        for (nid in nodes) {
            var node:NodeView = nodes[nid];
            if (node.dropboxes == null) {continue;}
            for (j = 0; j < node.dropboxes.length; ++j) {
                d = node.dropboxes[j];
                if (!d.valid) continue;
                var parentPanel:OutlineScrollView = node.panelView.outline;
                var y:number = mousePosition.top;
                y += parentPanel.scrollY - scrollStart[node.panelView.id];
                if (((mousePosition.left >= d.hover.left) && (mousePosition.left <= d.hover.right)) &&
                    ((y >= d.hover.top) && (y <= d.hover.bottom))) {
                    //assert(this.scrollPanel && parentPanel.elem === this.scrollPanel.elem,
                    //    "ERROR: Active panel does not match item");
                    return d;
                }
            }
        }
        return null;
    }
    static previewDropBoxes() {
        var i, j, d;
        var PM:typeof PanelManager;
        PM = PanelManager;
        for (var n = 1, p:string = PM.leftPanel;
            (p !== '') && (n <= PM.panelsPerScreen);
            ++n, p = PM.nextpanel[p]) {
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
                if (!d.valid) continue;
                $('<div></div>').appendTo(canvas)
                    .css('position', 'absolute')
                    .css('top', (d.hover.top - ctop) + 'px')
                    .css('left', (d.hover.left - cleft) + 'px')
                    .css('width', (d.hover.right - d.hover.left) + 'px')
                    .css('height', (d.hover.bottom - d.hover.top) + 'px')
                    .css('border', 'dotted red 1px');
            }
        }
        var nodes = NodeView.nodesById;
        var nid:string;
        for (nid in nodes) {
            var node:NodeView = nodes[nid];
            var view:OutlineScrollView = node.panelView.outline;
            var canvas = $('#' + view.droplayer.id);
            var ctop = canvas.offset().top;
            var cleft = canvas.offset().left;
            if (!node.dropboxes) {
                console.log("ERROR: Item " + i + " does not have dropboxes?");
                continue;
            }
            for (j = 0; j < node.dropboxes.length; ++j) {
                d = node.dropboxes[j];
                if (!d.valid) continue;
                $('<div></div>').appendTo(canvas)
                    .css('position', 'absolute')
                    .css('top', (d.hover.top - ctop) + 'px')
                    .css('left', (d.hover.left - cleft) + 'px')
                    .css('width', (d.hover.right - d.hover.left) + 'px')
                    .css('height', (d.hover.bottom - d.hover.top) + 'px')
                    .css('border', 'dotted red 1px');
            }
        }

    }

    render() {
        if (!this.valid) {return;}
        this.elem = $('<div></div>')
            .addClass(this.box.class)
            .css('top', this.box.top + 'px')
            .css('left', this.box.left + 'px')
            .css('height', this.box.height + 'px')
            .css('width', this.box.width + 'px').get(0);
        $(this.elem).appendTo(this.canvas.elem);
    }

    destroy() { // improve garbage collection vs. dropboxes = []?
    }
}
class DropBoxTop extends DropBox {
    view:NodeView;
    canvas:DropLayerView;

    constructor(node:NodeView) {
        super();
        this.valid = DropBox.dragger.validateNodeDropBox(node, 'top');
        if (!this.valid) {return;}
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
    handleDrop(node:NodeView, helper:HTMLElement) {
        var that = this;
        ActionManager.schedule(
            function() {
                return Action.checkTextChange(node.header.name.text.id);
            },
            function():SubAction {
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
    }
}
class DropBoxBottom extends DropBox {
    view:NodeView;
    canvas:DropLayerView;

    constructor(node:NodeView) {
        super();
        this.valid = DropBox.dragger.validateNodeDropBox(node, 'bottom');
        if (!this.valid) {return;}
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
    handleDrop(node:NodeView, helper:HTMLElement) {
        var that = this;
        ActionManager.schedule(
            function():SubAction {
                return Action.checkTextChange(node.header.name.text.id);
            },
            function():SubAction {
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
            });    }
}
class DropBoxHandle extends DropBox {
    view:NodeView;
    canvas:DropLayerView;

    constructor(node:NodeView) {
        super();
        this.valid = DropBox.dragger.validateNodeDropBox(node, 'handle');
        if (!this.valid) {return;}
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
    handleDrop(node:NodeView, helper:HTMLElement) {
        var that = this;
        ActionManager.schedule(
            function() {
                return Action.checkTextChange(node.header.name.text.id);
            },
            function():SubAction {
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
    }
}
class DropBoxLeft extends DropBox {
    view:PanelView;
    canvas:DrawLayerView;

    constructor(panel:PanelView) {
        super();
        this.valid = DropBox.dragger.validatePanelDropBox(panel, 'left');
        if (!this.valid) {return;}
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
    handleDrop(node:NodeView, helper:HTMLElement) {
        var that = this;
        ActionManager.schedule(
            function() {
                return Action.checkTextChange(node.header.name.text.id);
            },
            function():SubAction {
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
    }
}
class DropBoxRight extends DropBox {
    view:PanelView;
    canvas:DrawLayerView;

    constructor(panel:PanelView) {
        super();
        this.valid = DropBox.dragger.validatePanelDropBox(panel, 'right');
        if (!this.valid) {return;}
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
    handleDrop(node:NodeView, helper:HTMLElement) {
        var that = this;
        ActionManager.schedule(
            function():SubAction {
                return Action.checkTextChange(node.header.name.text.id);
            },
            function():SubAction {
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
    }
}

