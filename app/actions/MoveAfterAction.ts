///<reference path="Action.ts"/>

m_require("app/actions/OutlineAction.js");

class MoveAfterAction extends OutlineAction {
    type="MoveAfterAction";
    _validateOptions= {
        requireActive: true,
        requireReference: true,
        requireOld: true,
        requireNew: true
    };
    options= {activeID: null, referenceID: null, transition: false};
    getNewContext() {
        this.newModelContext = this.getContextAfter(this.options.referenceID);
    }
}
