///<reference path="../views/View.ts"/>
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
        class?:string;
        image?:string;
    };
    hover:{
        top?:number;
        left?:number;
        right?:number;
        bottom?:number;
    };
    elem:HTMLElement;

    constructor(view:View) {
        this.view = view;
        this.valid = this.validateDrop(DropBox.dragger.currentItem);
    }
    validateDrop(activeView:View):boolean {return true;}
    handleDrop(node:NodeView, helper:View) {}
    static removeAll() {
        var i:number, nid:string, pid:string;
        var panels = PanelView.panelsById;
        var nodes = NodeView.nodesById;
        for (nid in nodes) {
            if (nodes[nid].nodeRootView!=null) {
                var boxes = nodes[nid].dropboxes;
                for (i=0; i<boxes.length; ++i) {
                    boxes[i].remove();
                }
                nodes[nid].dropboxes = [];
            }
        }
        for (pid in panels) {
            var boxes = panels[pid].dropboxes;
            for (i=0; i<boxes.length; ++i) {
                boxes[i].remove();
            }
            panels[pid].dropboxes = [];
        }
    }
    static renderAll(dragger:DragHandler) {
        DropBox.dragger = dragger;
        var i:number, p:string, n:number, panel:PanelView, node:NodeView, nid:string;
        console.log("Rendering all drop boxes now");
        DropBox.removeAll(); // todo: we need not remove/insert them every time
        $(document.body).addClass('drop-mode');

        $D.lineHeight = Math.round(1.5 * Number($(document.body).css('font-size').replace(/px/, '')));
        var panelParent = (View.getCurrentPage()).content.gridwrapper.grid;
        var canvas0 = (<DiathinkView>View.getCurrentPage()).drawlayer;
        canvas0.cacheOffset = canvas0.getOffset();

        var m:string;
        var panels=panelParent.listItems;
        for (m=panels.first();m!=='';m=panels.next[m]) {
            var canvas1 = panels.obj[m].outline.droplayer;
            canvas1.cacheOffset = canvas1.getOffset();
        }

        var panels = View.getCurrentPage().content.gridwrapper.grid.listItems;
        var pid:string;

        for (pid=panels.first(); pid!==''; pid=panels.next[pid]) {
            panel = <PanelView>View.get(pid);
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
            if (node.nodeRootView!=null) { // node is not detached
                node.dropboxes = [];
                node.dropboxes.push(new DropBoxTop(node));
                node.dropboxes.push(new DropBoxBottom(node));
                node.dropboxes.push(new DropBoxHandle(node));
                node.dropboxes.push(new DropBoxLink(node));
                for (i = 0; i < node.dropboxes.length; ++i) {
                    node.dropboxes[i].render();
                }
            }
        }
    }
    static getHoverBox(mousePosition:PositionI, scrollStart:{[i:string]:number}):DropBox {
        var j:number, d:DropBox;
        // cache scroll-positions of each panel
        var pid:string;
        var panels = View.getCurrentPage().content.gridwrapper.grid.listItems;
        // loop over panels to return correct dropbox

        for (pid=panels.first(); pid!==''; pid=panels.next[pid]) {
            var panel:PanelView = <PanelView>View.get(pid);
            var scrollView:OutlineScrollView = panel.outline;
            scrollView.scrollY = scrollView.scrollHandler.getScrollPosition().y;
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
        var pid:string;
        var panels = View.getCurrentPage().content.gridwrapper.grid.listItems;
        for (pid=panels.first(); pid!==''; pid=panels.next[pid]) {
            var panel = View.get(pid);
            var canvas = $('#' + View.getCurrentPage().drawlayer.id);
            var ctop = View.currentPage.drawlayer.getOffset().top;
            var cleft = View.currentPage.drawlayer.getOffset().left;
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
            if (node.nodeRootView==null) {continue;}
            var view:OutlineScrollView = node.panelView.outline;
            var canvas = $('#' + view.droplayer.id);
            var ctop = view.droplayer.getOffset().top;
            var cleft = view.droplayer.getOffset().left;
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

    onHover() {
       $(this.elem).addClass('active');
    }
    onLeave() {
        $(this.elem).removeClass('active');
    }
    render() {
        if (!this.valid) {return;}
        var div = document.createElement('div');
        div.className = this.box.class;
        div.style.top = this.box.top+'px';
        div.style.left = this.box.left+'px';
        div.style.height = this.box.height+'px';
        div.style.width = this.box.width+'px';
        this.elem = div;
        if (this.box.image) {
            this.elem.innerHTML = '<img src="'+this.box.image+'" alt="'+this.box.image+'"/>';
        }
        this.canvas.elem.insertBefore(this.elem, null);
    }

    validateNodeBox(activeNode:NodeView, type:string) {
        var targetNode = <NodeView>this.view;
        // cannot drop current-item on itself
        if (targetNode=== activeNode) {
            return false;
        }
        // cannot drop the current-item inside itself
        var activeModel = activeNode.value;
        var itemModel = targetNode.value;
        var model = itemModel;
        while ((model != null) && (model !== activeModel)) {
            model = model.get('parent');
        }
        if (model != null) { // it is a child of itself
            return false;
        }
        if (type==='link') { // check if its already in the list
            if (targetNode.value.attributes.links==null) {
                return true;
            }
            if (targetNode.value.attributes.links.obj[activeNode.value.cid]!=null) {
                return false;
            } else {
                return true;
            }
        }

        // cannot drop current-item adjacent to itself
        if (activeModel.get('parent') === itemModel.get('parent')) {
            var nodes = activeModel.get('parent').attributes.children;
            if (nodes.next[itemModel.cid]===activeModel.cid) {
                if (type==='bottom') return false;
            } else if (nodes.next[activeModel.cid]===itemModel.cid) {
                if (type==='top') return false;
            }
        }
        if (activeModel.get('parent') === itemModel) {
            if (type==='handle') return false;
        }
        var prevElement:HTMLElement = <HTMLElement>targetNode.elem.previousSibling;
        if (prevElement && View.getFromElement(prevElement).nodeView.children.elem.children.length !== 0) {
            // predecessor has visible children, cannot drop above it
            if (type==='top') return false;
        }
        if (targetNode.children.elem.children.length !== 0) {
            // has visible children, cannot drop below it
            if (type==='bottom') return false;
        }
        if (targetNode.elem.nextSibling != null) {
            // not last in a list, cannot drop below it
            if (type==='bottom') return false;
        }
        return true;
    }

    remove() {
        if (this.elem && this.elem.parentNode) {
            this.elem.parentNode.removeChild(this.elem);
        }
    }
}
class DropBoxTop extends DropBox {
    view:NodeView;
    canvas:DropLayerView;

    constructor(node:NodeView) {
        super(node);
        this.canvas = node.panelView.outline.droplayer;
        this.box = {
            top: node.position.top - this.canvas.cacheOffset.top,
            left: node.position.left - this.canvas.cacheOffset.left + $D.lineHeight,
            height: 0,
            width: node.dimensions.width - 2.5 * $D.lineHeight, /* was 1.5 */
            class: 'dropborder'
        };
        this.hover = {
            top: node.position.top - $D.lineHeight / 2,
            left: node.position.left + $D.lineHeight,
            bottom: node.position.top + ($D.lineHeight / 2),
            right: node.position.left + node.dimensions.width - 1.5 * $D.lineHeight /* was 0.5 */
        };
    }
    handleDrop(node:NodeView, helper:View) {
        var that = this;
        ActionManager.simpleSchedule(View.focusedView,
            function():SubAction {
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
    }
    validateDrop(activeNode:NodeView) {
        return this.validateNodeBox(activeNode, 'top');
    }

}
class DropBoxBottom extends DropBox {
    view:NodeView;
    canvas:DropLayerView;

    constructor(node:NodeView) {
        super(node);
        this.canvas = node.panelView.outline.droplayer;
        this.box = {
            top: node.position.top + node.dimensions.height - this.canvas.cacheOffset.top - 1,
            left: node.position.left - this.canvas.cacheOffset.left + $D.lineHeight,
            height: 0,
            width: node.dimensions.width - 2.5 * $D.lineHeight, /* was 1.5 */
            class: 'dropborder'
        };
        this.hover = {
            top: node.position.top + node.dimensions.height - $D.lineHeight / 2,
            left: node.position.left + $D.lineHeight,
            bottom: node.position.top + node.dimensions.height + ($D.lineHeight / 2),
            right: node.position.left + node.dimensions.width - 1.5 * $D.lineHeight /* was 0.5 */
        };
    }
    handleDrop(node:NodeView, helper:View) {
        var that = this;
        ActionManager.simpleSchedule(View.focusedView,
            function():SubAction {
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
    }
    validateDrop(activeNode:NodeView) {
        return this.validateNodeBox(activeNode, 'bottom');
    }
}
class DropBoxHandle extends DropBox {
    view:NodeView;
    canvas:DropLayerView;

    constructor(node:NodeView) {
        super(node);
        this.canvas = node.panelView.outline.droplayer;
        this.box = {
            top: node.position.top - this.canvas.cacheOffset.top - 1,
            left: node.position.left - this.canvas.cacheOffset.left - 1,
            class: 'droparrow',
            image: 'theme/images/into.png'
        };
        this.hover = {
            top: node.position.top,
            left: node.position.left,
            bottom: node.position.top + $D.lineHeight,
            right: node.position.left + $D.lineHeight
        };
    }
    handleDrop(node:NodeView, helper:View) {
        var that = this;
        ActionManager.simpleSchedule(View.focusedView,
            function():SubAction {
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
    }
    validateDrop(activeNode:NodeView) {
        return this.validateNodeBox(activeNode, 'handle');
    }
}

class DropBoxLink extends DropBox {
    view:NodeView;
    canvas:DropLayerView;

    constructor(node:NodeView) {
        super(node);
        this.canvas = node.panelView.outline.droplayer;
        this.box = {
            top: node.position.top - this.canvas.cacheOffset.top - 1,
            left: node.position.left + node.dimensions.width - this.canvas.cacheOffset.left - $D.lineHeight - 1,
            width: $D.lineHeight,
            height: $D.lineHeight,
            class: 'droplink',
            image: 'theme/images/plus.png'
        };
        this.hover = {
            top: node.position.top,
            left: node.position.left + node.dimensions.width - $D.lineHeight,
            bottom: node.position.top + $D.lineHeight,
            right: node.position.left + node.dimensions.width
        };
    }
    handleDrop(node:NodeView, helper:View) {
        var that = this;
        ActionManager.simpleSchedule(View.focusedView,
            function():SubAction {
                return {
                    actionType: AddLinkAction,
                    referenceID: that.view.value.cid,
                    activeID: node.value.cid,
                    oldRoot: node.nodeRootView.id,
                    newRoot: that.view.nodeRootView.id,
                    anim: 'dock',
                    dockView: helper,
                    focus: false
                };
            });
    }
    validateDrop(activeNode:NodeView) {
        return this.validateNodeBox(activeNode, 'link');
    }
}

class DropBoxLeft extends DropBox {
    view:PanelView;
    canvas:DrawLayerView;

    constructor(panel:PanelView) {
        super(panel);
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
    handleDrop(node:NodeView, helper:View) {
        var that = this;
        ActionManager.simpleSchedule(View.focusedView,
            function():SubAction {
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
    }
    validateDrop(activeNode:NodeView) {
        if (View.getCurrentPage().content.gridwrapper.grid.listItems.first() === this.view.id) {
            return true;
        }
        return false;
    }
}
class DropBoxRight extends DropBox {
    view:PanelView;
    canvas:DrawLayerView;

    constructor(panel:PanelView) {
        super(panel);
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
    handleDrop(node:NodeView, helper:View) {
        var that = this;
        ActionManager.simpleSchedule(View.focusedView,
            function():SubAction {
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
    }
    validateDrop(activeNode:NodeView) {
        return true;
    }
}

