///<reference path="Action.ts"/>

m_require("app/actions/OutlineAction.js");

class InsertAfterAction extends OutlineAction {
    type="InsertAfterAction";
    disableAnimation = true;
    // options:ActionOptions= {activeID: null, referenceID: null, text: ""};
    _validateOptions= {
        requireActive: false,
        requireReference: true,
        requireOld: false,
        requireNew: true
    };
    getNewContext() {
        this.newModelContext = OutlineNodeModel.getById(this.options.referenceID).getContextAfter();
    }
}

