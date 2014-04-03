///<reference path="Action.ts"/>

m_require("app/actions/OutlineAction.js");

class DeleteAction extends OutlineAction {
    type="DeleteAction";
    _validateOptions= {
        requireActive: true,
        requireReference: false,
        requireOld: true,
        requireNew: false
    };
    // options:ActionOptions = {activeID: null, transition: false};
    focus() {
        var newRoot, li, model, collection, rank, cursorstart=false, cursor;
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
            if (!li) { // try following sibling
                if (this.oldModelContext.next == null) {
                    return; // no other elements in view
                }
                li = this.getLineView(this.oldModelContext.next, newRoot);
                cursorstart = true;
            }
        } else { // goto prior sibling.
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
    }
    getNewContext() {
        this.newModelContext = null;
    }
}
