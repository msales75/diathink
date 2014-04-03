///<reference path="Action.ts"/>

m_require("app/actions/OutlineAction.js");

class MoveIntoAction extends OutlineAction {
    type="MoveIntoAction";
    _validateOptions= {
        requireActive: true,
        requireReference: true,
        requireOld: true,
        requireNew: false,
        requireNewReference: true
    };
    // options:ActionOptions= {activeID: null, referenceID: null, transition: false};
    getNewContext() {
        this.newModelContext = this.getContextIn(this.options.referenceID);
    }
}

