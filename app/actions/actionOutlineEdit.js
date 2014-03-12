m_require("app/actions/actionOutlineBase.js");

$D.InsertAfterAction = $D.OutlineAction.extend({
    type:"InsertAfterAction",
    options: {activeID: null, referenceID: null, text: ""},
    _validateOptions: {
        requireActive: false,
        requireReference: true,
        requireOld: false,
        requireNew: true
    },
    getNewContext: function() {
        this.newModelContext = this.getContextAfter(this.options.referenceID);
    }
});

$D.MoveAfterAction = $D.OutlineAction.extend({
    type:"MoveAfterAction",
    _validateOptions: {
        requireActive: true,
        requireReference: true,
        requireOld: true,
        requireNew: true
    },
    options: {activeID: null, referenceID: null, transition: false},
    getNewContext: function() {
        this.newModelContext = this.getContextAfter(this.options.referenceID);
    }
});

$D.MoveBeforeAction = $D.OutlineAction.extend({
    type:"MoveBeforeAction",
    _validateOptions: {
        requireActive: true,
        requireReference: true,
        requireOld: true,
        requireNew: true
    },
    options: {activeID: null, referenceID: null, transition: false},
    getNewContext: function() {
        this.newModelContext = this.getContextBefore(this.options.referenceID);
    }
});

$D.MoveIntoAction = $D.OutlineAction.extend({
    type:"MoveIntoAction",
    _validateOptions: {
        requireActive: true,
        requireReference: true,
        requireOld: true,
        requireNew: false,
        requireNewReference: true
    },
    options: {activeID: null, referenceID: null, transition: false},
    getNewContext: function() {
        this.newModelContext = this.getContextIn(this.options.referenceID);
    }
});

// todo: merge outdent with moveafter action?
$D.OutdentAction = $D.OutlineAction.extend({
    type:"OutdentAction",
    _validateOptions: {
        requireActive: true,
        requireReference: true,
        requireOld: true,
        requireNew: true
    },
    options: {activeID: null, referenceID: null, transition: false},
    getNewContext: function() {
        this.newModelContext = this.getContextAfter(this.options.referenceID);
    }
});

$D.DeleteAction = $D.OutlineAction.extend({
    type:"DeleteAction",
    _validateOptions: {
        requireActive: true,
        requireReference: false,
        requireOld: true,
        requireNew: false
    },
    options: {activeID: null, transition: false},
    focus: function() {
        var newRoot, li, model, collection, rank, cursorstart=false, cursor;
        if (this.options.undo) {
            li = this.getLineView(this.options.activeID, this.options.oldRoot);
            View.setFocus(li);
            var elem = $('#'+li.header.name.text.id);
            elem.setCursor(0);
            elem.focus();
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
        var elem = $('#'+li.header.name.text.id);
        if (cursorstart) {
            elem.setCursor(0);
            elem.focus();
        } else {
            cursor = elem.val().length;
            elem.setCursor(cursor);
            elem.focus();
        }
    },
    getNewContext: function() {
        this.newModelContext = null;
    }
});
