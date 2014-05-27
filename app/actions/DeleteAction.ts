///<reference path="Action.ts"/>

m_require("app/actions/OutlineAction.js");

class DeleteAction extends OutlineAction {
    disableAnimation = true;
    type="DeleteAction";
    _validateOptions= {
        requireActive: true,
        requireReference: false,
        requireOld: true,
        requireNew: false
    };
    // options:ActionOptions = {activeID: null, transition: false};
    getNewContext() {
        this.newModelContext = null;
    }
}
