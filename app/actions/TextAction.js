///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/actions/Action.js");

var TextAction = (function (_super) {
    __extends(TextAction, _super);
    function TextAction() {
        _super.apply(this, arguments);
        this.type = "TextAction";
        this.options = { activeID: null, text: null, transition: false };
        this._validateOptions = {
            requireActive: true,
            requireReference: false,
            requireOld: true,
            requireNew: true
        };
    }
    TextAction.prototype.execModel = function () {
        var that = this;
        that.addQueue('newModelAdd', ['context'], function () {
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
    };
    TextAction.prototype.execView = function (outline) {
        var that = this;
        this.addQueue(['view', outline.nodeRootView.id], ['newModelAdd'], function () {
            var text;
            if (that.options.undo) {
                text = that.oldText;
            } else {
                text = that.options.text;
            }
            var activeLineView = that.getLineView(that.options.activeID, outline.nodeRootView.id);
            if (activeLineView != null) {
                activeLineView.header.name.text.value = text;

                // console.log("Updating view "+activeLineView.header.name.text.id+" to value "+this.options.text);
                $('#' + activeLineView.header.name.text.id).val(text).text(text);
                activeLineView.header.name.text.fixHeight();
            }
            // satisfy additional dependencies that are never used in this actiontype
            // that.runtime.status.linePlaceAnim[outline.nodeRootView.id] = 2;
        });
    };
    return TextAction;
})(Action);
//# sourceMappingURL=TextAction.js.map
