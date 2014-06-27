///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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

var AddLinkAction = (function (_super) {
    __extends(AddLinkAction, _super);
    function AddLinkAction() {
        _super.apply(this, arguments);
        this.type = 'AddLinkAction';
    }
    // newLinks:{[id:string]:string} = {};
    AddLinkAction.prototype.runinit = function () {
        _super.prototype.runinit.call(this, arguments);
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
        var o = this.options, r = this.runtime;
        if (o.undo) {
            r.rNewRoot = o.oldRoot;
            r.rOldRoot = o.newRoot;
        } else {
            r.rNewRoot = o.newRoot;
            r.rOldRoot = o.oldRoot;
            // this.newLinks = {};
        }
    };
    AddLinkAction.prototype.runinit2 = function () {
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
    };
    AddLinkAction.prototype.getFocusNode = function () {
        // by default, focus on activeID in newRoot
        var newRoot;
        if (this.options.undo) {
            newRoot = this.options.oldRoot;
        } else {
            newRoot = this.options.newRoot;
        }
        if (this.options.referenceID === 'chatbox') {
            var o;
            for (o in OutlineRootView.outlinesById) {
                if (OutlineRootView.outlinesById[o].panelView.chatbox.isActive) {
                    // console.log("Found chatbox for AddLink getFocusNode()");
                    return OutlineRootView.outlinesById[o].panelView.chatbox;
                }
            }

            // console.log("Did not find chatbox for AddLink getFocusNode()");
            return null;
        } else {
            // console.log("Did not have cid=chatbox");
            return this.getNodeView(this.options.referenceID, newRoot);
        }
    };

    AddLinkAction.prototype.validateOptions = function () {
        var linkModel = OutlineNodeModel.getById(this.options.activeID);
        var nodeModel = OutlineNodeModel.getById(this.options.referenceID);
        assert(linkModel != null, "Invalid linkModel");
        assert(nodeModel != null, "Invalid nodeModel");
        assert(linkModel !== nodeModel, "Node cannot link itself");
        var reverse = ((this.options.undo && !this.options.delete) || (!this.options.undo && this.options.delete));
        if (reverse) {
            assert(nodeModel.attributes.links.obj[linkModel.cid] === linkModel, "Missing linkModel before undo");
            var outlines = OutlineRootView.outlinesById;
            var o;
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
        } else {
            assert(nodeModel.attributes.links.obj[linkModel.cid] === undefined, "linkModel already in links before adding");
            // assert(_.size(this.newLinks)===0, "Cannot have newLinks defined before action");
        }
    };

    // must be called before placeholders inserted
    AddLinkAction.prototype.execModel = function () {
        var that = this;
        that.addQueue('newModelAdd', ['context'], function () {
            var node = OutlineNodeModel.getById(that.options.referenceID);
            var linkm = OutlineNodeModel.getById(that.options.activeID);
            var reverse = ((that.options.undo && !that.options.delete) || (!that.options.undo && that.options.delete));
            if (reverse) {
                assert(node.attributes.links.obj[linkm.cid] != null, "Removing a link that doesn't exist");
                node.attributes.links.remove(linkm.cid);
                linkm.attributes.backLinks.remove(node.cid);
            } else {
                // add link to model
                assert(node.attributes.links.obj[linkm.cid] === undefined, "Adding a link to a node that already exists");
                node.attributes.links.append(linkm.cid, linkm);
                if (linkm.attributes.backLinks == null) {
                    linkm.attributes.backLinks = new OutlineNodeCollection();
                }
                linkm.attributes.backLinks.append(node.cid, node);
            }
        });
    };
    AddLinkAction.prototype.execView = function (outline) {
        var that = this;
        this.addQueue(['view', outline.nodeRootView.id], ['newModelAdd'], function () {
            var refLineView;

            // check for chatbox in this panel
            if ((that.options.referenceID === 'chatbox') && (outline.panelView.chatbox.isActive)) {
                refLineView = outline.panelView.chatbox;
            } else {
                refLineView = that.getNodeView(that.options.referenceID, outline.nodeRootView.id);
            }

            if (refLineView != null) {
                // update listItems, update DOM
                var reverse = ((that.options.undo && !that.options.delete) || (!that.options.undo && that.options.delete));
                if (reverse) {
                    // find item in list with correct value
                    // for (o in that.newLinks)
                    var linkid = null;
                    var links = refLineView.header.name.listItems;
                    var l;
                    for (l in links.obj) {
                        if (links.obj[l].value.cid === that.options.activeID) {
                            linkid = l;
                            break;
                        }
                    }
                    assert(linkid != null, "Could not found link to remove");
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
            if (that.options.activeID) {
                var activeView = that.getNodeView(that.options.activeID, outline.nodeRootView.id);
                if (activeView && activeView.elem) {
                    $(activeView.elem).removeClass('drag-hidden');
                    activeView.header.linkcount.addLink();
                }
            }
            if (that.options.dockView) {
                $(document.body).removeClass('transition-mode');
                that.options.dockView.destroy();
                that.options.dockView = undefined;
            }
        });
    };
    return AddLinkAction;
})(AnimatedAction);
//# sourceMappingURL=AddLinkAction.js.map
