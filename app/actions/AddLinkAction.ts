///<reference path="Action.ts"/>

// todo: get the information we need early on from action,
//  to know what the oldType, newType and contexts are.

// types: line, panel, link, breadcrumb, inlink
// for each type, must have location, box-dims, text-size,


// todo: Put text and collapsed into oldModelContext/newModelContext
// todo: Put old-focus & view-collapsed into ?
// todo: Put panel into new/oldPanelContext

// Flag for scroll
// todo: action stores oldFocus and newFocus ? (maybe not)
// todo: handle focusID in context, and validate it.
// todo: undo-scroll (maybe focus)
m_require("app/actions/AnimatedAction.js");

class AddLinkAction extends AnimatedAction {
    _validateOptions;
    // newLinks:{[id:string]:string} = {};
    runinit() {
        super.runinit.call(this, arguments);
        _.extend(this.runtime, {
            oldLineContext: {},
            status: {
                context: 0,
                log: 0,
                undobuttons: 0,
                oldModelCollection: 0,
                oldModelRemove: 0,
                modelCreate: 0,
                newModelRank: 0,
                newModelAdd: 0,
                focus: 0,
                end: 0,
                view: {},
                createDockElem: 0,
                dockAnim: 0,
                panelPrep: 0,
                anim: 0,
                oldLinePlace: {},
                newLinePlace: {}
            }
        });
        var o:ActionOptions = this.options,
            r:RuntimeOptions = this.runtime;
        if (o.undo) {
            r.rNewRoot = o.oldRoot;
            r.rOldRoot = o.newRoot;
        } else {
            r.rNewRoot = o.newRoot;
            r.rOldRoot = o.oldRoot;
           // this.newLinks = {};
        }
    }
    runinit2() {
        if (this.options.undo) {
            /*
             this.usePostAnim = true;
            this.dropSource = new PanelDropSource({
                panelID: this.newPanel,
                useFade: true
            });
            */
        } else {
            /*
             this.usePostAnim = false;
            this.dropSource = new NodeDropSource({
                activeID: this.options.activeID,
                outlineID: this.options.oldRoot,
                dockView: this.options.dockView,
                useDock: true,
                dockTextOnly: true,
                usePlaceholder: false
            });
            this.dropTarget = new PanelDropTarget({
                activeID: this.options.activeID,
                panelID: View.currentPage.content.gridwrapper.grid.getInsertLocation(this.options.prevPanel),
                prevPanel: this.options.prevPanel,
                usePlaceholder: true
            });
            */
        }
        /*
        this.dropTarget = new LinkDropTarget({
            rNewModelContext: r.rNewModelContext,
            activeID:this.options.activeID,
            outlineID: r.rNewRoot,
            oldOutlineID: r.rOldRoot
        });
        */
    }

    validateOptions() {
        var linkModel = OutlineNodeModel.getById(this.options.activeID);
        var nodeModel = OutlineNodeModel.getById(this.options.referenceID);
        assert(linkModel!=null, "Invalid linkModel");
        assert(nodeModel!=null, "Invalid nodeModel");
        assert(linkModel!==nodeModel, "Node cannot link itself");
        if (this.options.undo) { // must already exist in list
            assert(nodeModel.attributes.links.obj[linkModel.cid]===linkModel,
                "Missing linkModel before undo");
            var outlines = OutlineRootView.outlinesById;
            var o:string;
            /*
            for (o in outlines) {
                if (nodeModel.views && nodeModel.views[o]) {
                    assert(nodeModel.views[o].header.name.listItems.obj[this.newLinks[o]].value === linkModel,
                        "newLinks missing when view is visible");
                } else {
                    assert(this.newLinks[o]==null, "newLinks defined when view not available");
                }
            }
            for (o in this.newLinks) {
                assert(outlines[o]!==undefined, "newLinks has invalid outline in list");
                assert(View.get(this.newLinks[o]) instanceof NodeLinkView, "newLinks does not point to valid view");
            }
            */
        } else { // must not already exist in list
            assert(nodeModel.attributes.links.obj[linkModel.cid]===undefined,
                "linkModel already in links before adding");
            // assert(_.size(this.newLinks)===0, "Cannot have newLinks defined before action");
        }
    }

    // must be called before placeholders inserted
    execModel() {
        var that = this;
        that.addQueue('newModelAdd', ['context'], function() {
            var node:OutlineNodeModel = OutlineNodeModel.getById(that.options.referenceID);
            var linkm = OutlineNodeModel.getById(that.options.activeID);
            if (that.options.undo) { // remove link from model
                assert(node.attributes.links.obj[linkm.cid]!=null,
                    "Removing a link that doesn't exist");
                node.attributes.links.remove(linkm.cid);
                linkm.attributes.backLinks.remove(node.cid);
            } else {
                // add link to model
                assert(node.attributes.links.obj[linkm.cid]===undefined,
                    "Adding a link to a node that already exists");
                node.attributes.links.append(linkm.cid, linkm);
                if (linkm.attributes.backLinks==null) {
                    linkm.attributes.backLinks = new OutlineNodeCollection();
                }
                linkm.attributes.backLinks.append(node.cid, node);
            }
        });
    }
    execView(outline) {
        var that = this;
        this.addQueue(['view', outline.nodeRootView.id], ['newModelAdd'], function() {
            var refLineView = that.getNodeView(that.options.referenceID, outline.nodeRootView.id);
            if (refLineView != null) {
                // update listItems, update DOM
                if (that.options.undo) {
                    // todo: remove the listItem and fixHeight
                    // find item in list with correct value
                    // for (o in that.newLinks)
                    var linkid:string = null;
                    var links = refLineView.header.name.listItems;
                    var l:string;
                    for (l in links.obj) {
                        if (links.obj[l].value.cid === that.options.activeID) {
                            linkid = l;
                            break;
                        }
                    }
                    assert(linkid!=null, "Could not found link to remove");
                    refLineView.header.name.listItems.remove(linkid);
                    View.get(linkid).destroy();
                    // refLineView.header.name.text.fixHeight();
                    refLineView.header.name.text.resizeUp();
                } else {
                    var linkview = new NodeLinkView({
                        parentView: refLineView.header.name,
                        value: OutlineNodeModel.getById(that.options.activeID)
                    });
                    // that.newLinks[outline.id] = linkview.id;
                    linkview.render();
                    refLineView.header.name.listItems.append(linkview.id, linkview);
                    refLineView.header.name.elem.appendChild(linkview.elem);
                    // refLineView.header.name.text.fixHeight();
                    refLineView.header.name.text.resizeUp();
                }
            }
            // remove helper-stuff when done, since we're not using animator
            that.getNodeView(that.options.activeID, outline.nodeRootView.id).removeClass('drag-hidden');
            if (that.options.dockView) {
                $(document.body).removeClass('transition-mode');
                that.options.dockView.destroy();
                that.options.dockView = undefined;
            }
        });
    }
}


