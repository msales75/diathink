///<reference path="Action.ts"/>

m_require("app/actions/OutlineAction.js");

class CopyAfterAction extends OutlineAction {
    type="CopyAfterAction";
    _validateOptions= {
        requireActive: false,
        requireReference: true,
        requireOld: false,
        requireNew: true
    };
    // options:ActionOptions= {activeID: null, referenceID: null, transition: false};
    getNewContext() {
        this.newModelContext = OutlineNodeModel.getById(this.options.referenceID).getContextAfter();
    }
}
