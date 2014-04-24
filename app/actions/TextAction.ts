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
                activeLineView.header.name.text.value = text;
                // console.log("Updating view "+activeLineView.header.name.text.id+" to value "+this.options.text);
                $('#'+activeLineView.header.name.text.id).val(text).text(text);
                activeLineView.header.name.text.fixHeight();
            }
            // satisfy additional dependencies that are never used in this actiontype
            // that.runtime.status.linePlaceAnim[outline.nodeRootView.id] = 2;
        });
    }
}
