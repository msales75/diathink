///<reference path="Action.ts"/>

m_require("app/actions/OutlineAction.js");

class InsertAfterAction extends OutlineAction {
    type="InsertAfterAction";
    // options:ActionOptions= {activeID: null, referenceID: null, text: ""};
    _validateOptions= {
        requireActive: false,
        requireReference: true,
        requireOld: false,
        requireNew: true
    };
    getNewContext() {
        this.newModelContext = this.getContextAfter(this.options.referenceID);
    }
}

