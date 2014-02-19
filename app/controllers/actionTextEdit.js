m_require("app/controllers/actionBase.js");

$D.TextAction= $D.Action.extend({
    type:"TextAction",
    options: {activeID: null, text: null, transition: false},
    _validateOptions: {
        requireActive: true,
        requireReference: false,
        requireOld: true,
        requireNew: true
    },
    execModel: function () {
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
    },
    execView:function (outline) {
        var that = this;
        this.addQueue(['view', outline.rootID], ['newModelAdd'], function() {
            var text;
            if (that.options.undo) {
                text = that.oldText;
            } else {
                text = that.options.text;
            }
            var activeLineView = that.getLineView(that.options.activeID, outline.rootID);
            if (activeLineView != null) {
                activeLineView.header.name.text.value = text;
                // console.log("Updating view "+activeLineView.header.name.text.id+" to value "+this.options.text);
                $('#'+activeLineView.header.name.text.id).val(text).text(text);
                activeLineView.header.name.text.themeUpdate();
            }
            // satisfy additional dependencies that are never used in this actiontype
            // that.runtime.status.linePlaceAnim[outline.rootID] = 2;
        });
    }
});
