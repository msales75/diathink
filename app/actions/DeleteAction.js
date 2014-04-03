///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/actions/OutlineAction.js");

var DeleteAction = (function (_super) {
    __extends(DeleteAction, _super);
    function DeleteAction() {
        _super.apply(this, arguments);
        this.type = "DeleteAction";
        this._validateOptions = {
            requireActive: true,
            requireReference: false,
            requireOld: true,
            requireNew: false
        };
    }
    // options:ActionOptions = {activeID: null, transition: false};
    DeleteAction.prototype.focus = function () {
        var newRoot, li, model, collection, rank, cursorstart = false, cursor;
        if (this.options.undo) {
            li = this.getLineView(this.options.activeID, this.options.oldRoot);
            View.setFocus(li);
            li.header.name.text.setCursor(0);
            li.header.name.text.focus();
            return;
        }
        newRoot = this.options.newRoot;

        // this won't work because model has been deleted.
        if (this.oldModelContext.prev == null) {
            // check if parent is visible
            li = null;
            if (this.oldModelContext.parent != null) {
                li = this.getLineView(this.oldModelContext.parent, newRoot);
            }
            if (!li) {
                if (this.oldModelContext.next == null) {
                    return;
                }
                li = this.getLineView(this.oldModelContext.next, newRoot);
                cursorstart = true;
            }
        } else {
            li = this.getLineView(this.oldModelContext.prev, newRoot);
            if (!li) {
                console.log('ERROR: Missing prior view for focus');
                debugger;
            }
        }
        View.setFocus(li);
        if (cursorstart) {
            li.header.name.text.setCursor(0);
            li.header.name.text.focus();
        } else {
            cursor = li.header.name.text.getValue().length;
            li.header.name.text.setCursor(cursor);
            li.header.name.text.focus();
        }
    };
    DeleteAction.prototype.getNewContext = function () {
        this.newModelContext = null;
    };
    return DeleteAction;
})(OutlineAction);
//# sourceMappingURL=DeleteAction.js.map
