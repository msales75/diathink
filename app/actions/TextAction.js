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
            var activeLineView = that.getNodeView(that.options.activeID, outline.nodeRootView.id);
            if (activeLineView != null) {
                if (!activeLineView.panelView.browseChat) {
                    activeLineView.header.name.text.setValue(text);
                    activeLineView.header.name.text.resizeUp();
                }
                // console.log("Updating view "+activeLineView.header.name.text.id+" to value "+this.options.text);
            }

            // Check this outline for links connected to this item
            var links = OutlineNodeModel.getById(that.options.activeID).attributes.backLinks;
            var l;
            if (links != null) {
                for (l = links.first(); l !== ''; l = links.next[l]) {
                    var model = links.obj[l];
                    if (model.views && model.views[outline.id]) {
                        model.views[outline.id].header.name.redrawLinks();
                    }
                }
            }
            if (!activeLineView) {
                var model = outline.panelView.value;
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
    };
    TextAction.prototype.placeCursor = function (text) {
        if (this.options.cursor) {
            var c = this.options.cursor;
            if ($D.is_android) {
                ++c[0];
                ++c[1];
            }
            text.setSelection(c[0], c[1]);
        }
    };
    return TextAction;
})(Action);
//# sourceMappingURL=TextAction.js.map
