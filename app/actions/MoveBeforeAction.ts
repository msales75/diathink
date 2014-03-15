///<reference path="Action.ts"/>

m_require("app/actions/OutlineAction.js");

class MoveBeforeAction extends OutlineAction {
    type="MoveBeforeAction";
    _validateOptions= {
        requireActive: true,
        requireReference: true,
        requireOld: true,
        requireNew: true
    };
    options= {activeID: null, referenceID: null, transition: false};
    getNewContext() {
        this.newModelContext = this.getContextBefore(this.options.referenceID);
    }
}
