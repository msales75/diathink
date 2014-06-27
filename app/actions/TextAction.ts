///<reference path="Action.ts"/>

m_require("app/actions/Action.js");

class TextAction extends Action {
    type="TextAction";
    // options:ActionOptions = {activeID: null, text: null, transition: false};
    oldText:string;
    _validateOptions= {
        requireActive: true,
        requireReference: false,
        requireOld: true,
        requireNew: true
    };
    execModel() {
        var that = this;
        that.addQueue('newModelAdd', ['context'], function() {
            var text;
            if (that.options.undo) {
                text = that.oldText;
            } else {
                text = that.options.text;
            }
            var activeModel = that.getModel(that.options.activeID);
            if ((!that.options.undo) && (!that.options.redo)) {
                that.oldText = activeModel.get('text');
            }
            activeModel.set('text', text);
        });
    }
    execView(outline) {
        var that = this;
        this.addQueue(['view', outline.nodeRootView.id], ['newModelAdd'], function() {
            var text;
            if (that.options.undo) {
                text = that.oldText;
            } else {
                text = that.options.text;
            }
            var activeLineView = that.getNodeView(that.options.activeID, outline.nodeRootView.id);
            if (activeLineView != null) {
                if (! activeLineView.panelView.browseChat) {
                    activeLineView.header.name.text.setValue(text);
                    activeLineView.header.name.text.resizeUp();
                }
                // console.log("Updating view "+activeLineView.header.name.text.id+" to value "+this.options.text);
            }

            // Check this outline for links connected to this item
            var links:OutlineNodeCollection = OutlineNodeModel.getById(that.options.activeID).attributes.backLinks;
            var l:string;
            if (links!=null) {
                for (l=links.first();l!=='';l=links.next[l]) {
                    var model:OutlineNodeModel = (<OutlineNodeModel>links.obj[l]);
                    if (model.views && model.views[outline.id]) {
                        model.views[outline.id].header.name.redrawLinks();
                    }
                }
            }
            if (!activeLineView) { // fix panels which use this text in their breadcrumbs or title
                var model:OutlineNodeModel = outline.panelView.value;
                while (model && (model.cid !== that.options.activeID)) {
                    model = model.get('parent');
                }
                if (model) {
                    outline.panelView.breadcrumbs.updateValue();
                    outline.panelView.breadcrumbs.renderUpdate();
                }
            }

            // satisfy additional dependencies that are never used in this actiontype
            // that.runtime.status.linePlaceAnim[outline.nodeRootView.id] = 2;
        });
    }
    placeCursor(text:TextAreaView) {
        if (this.options.cursor) {
            var c = this.options.cursor;
            if ($D.is_android) {
                ++c[0];
                ++c[1];
            }
            text.setSelection(c[0], c[1]);
        }
    }
}
