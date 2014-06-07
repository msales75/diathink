///<reference path="Action.ts"/>

m_require("app/actions/OutlineAction.js");

class CopyIntoAction extends OutlineAction {
    type="CopyIntoAction";
    _validateOptions= {
        requireActive: false,
        requireReference: true,
        requireOld: false,
        requireNew: true
    };
    // options:ActionOptions= {activeID: null, referenceID: null, transition: false};
    getNewContext() {
        this.newModelContext = OutlineNodeModel.getById(this.options.referenceID).getContextIn();
    }
}

